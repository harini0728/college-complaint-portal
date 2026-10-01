// Step 8 test: complaint status timeline (Complaint.statusHistory).
//
// Run from the backend folder (MongoDB running, backend/.env filled in):
//   node test-step8.js
//
// It starts the API on a random free port, creates its own users and
// complaints (emails start with "step8-<time>"), and deletes them at the end.
// Nothing else in the database is changed.

process.env.NODE_ENV = 'test' // before the app loads, so request logging is off

const { env } = await import('./src/config/env.js')
const { connectDB, disconnectDB } = await import('./src/config/db.js')
const { default: app } = await import('./src/app.js')
const { default: User } = await import('./src/models/User.js')
const { default: Complaint } = await import('./src/models/Complaint.js')
const { generateToken } = await import('./src/utils/generateToken.js')
const { ROLES } = await import('./src/constants/roles.js')
const { default: mongoose } = await import('mongoose')

if (env.isProduction) {
  console.error('Refusing to run the tests with NODE_ENV=production.')
  process.exit(1)
}

// ---------- tiny test helpers ----------

let passed = 0
let failed = 0

function check(name, condition, detail) {
  if (condition) {
    passed += 1
    console.log(`  PASS  ${name}`)
  } else {
    failed += 1
    console.log(`  FAIL  ${name}${detail === undefined ? '' : `\n          ${detail}`}`)
  }
}

const section = (title) => console.log(`\n${title}`)
const show = (value) => JSON.stringify(value)
const isDate = (value) => typeof value === 'string' && !Number.isNaN(Date.parse(value))
const time = (value) => new Date(value).getTime()
const statuses = (history) => (history ?? []).map((entry) => entry.status)
const isOldestFirst = (history) =>
  Array.isArray(history) &&
  history.length > 1 &&
  history.every((entry, i) => i === 0 || time(entry.changedAt) >= time(history[i - 1].changedAt))

let baseUrl = ''

async function api(method, path, { token, body } = {}) {
  const response = await fetch(`${baseUrl}/api${path}`, {
    method,
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
    },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  })
  let data = null
  try {
    data = await response.json()
  } catch {
    // not JSON
  }
  return { status: response.status, data }
}

// The history exactly as stored in MongoDB (no defaults, no JSON transform).
async function storedHistory(id) {
  const doc = await Complaint.findById(id).lean()
  return doc?.statusHistory
}

async function storedComplaint(id) {
  return Complaint.findById(id).lean()
}

// ---------- the tests ----------

const tag = `step8-${Date.now()}`
const password = 'Passw0rd!123'
const createdUserIds = []

async function makeUser(label, role = ROLES.STUDENT) {
  const user = await User.create({
    name: `Step8 ${label}`,
    email: `${tag}-${label.toLowerCase().replace(/\s+/g, '')}@example.test`,
    password,
    role,
  })
  createdUserIds.push(user._id)
  return { user, token: generateToken(user) }
}

const makeComplaint = (owner, extra = {}) =>
  Complaint.create({
    title: 'Step 8 timeline test',
    description: 'Created by test-step8.js to check the status timeline.',
    category: 'Hostel',
    location: 'Block A',
    submittedBy: owner._id,
    ...extra,
  })

// A complaint as it was saved before Step 8: no statusHistory at all.
// Goes straight to the collection so the model's hooks cannot add one.
async function insertLegacyComplaint(owner, fields) {
  const result = await Complaint.collection.insertOne({
    title: 'Step 8 legacy complaint',
    description: 'Saved without a status history, like complaints from before Step 8.',
    category: 'Hostel',
    location: 'Block B',
    status: 'Pending',
    attachment: null,
    adminResponse: null,
    resolvedAt: null,
    submittedBy: owner._id,
    __v: 0,
    ...fields,
  })
  return String(result.insertedId)
}

async function run() {
  const admin = await makeUser('Admin', ROLES.ADMIN)
  const studentA = await makeUser('Student A')
  const studentB = await makeUser('Student B')

  // ----- 1. A new complaint starts its history -----
  section('1. A new complaint starts its history')

  const created = await api('POST', '/complaints', {
    token: studentA.token,
    body: {
      title: 'Step 8 created through the API',
      description: 'Created by test-step8.js through POST /api/complaints.',
      category: 'Hostel',
      location: 'Block A',
    },
  })
  const createdComplaint = created.data?.complaint
  const firstEntry = createdComplaint?.statusHistory?.[0]

  check('POST /api/complaints answers 201', created.status === 201, `got ${created.status}`)
  check(
    'new complaint has exactly one history entry',
    createdComplaint?.statusHistory?.length === 1,
    show(createdComplaint?.statusHistory),
  )
  check('the entry is "Pending"', firstEntry?.status === 'Pending', show(firstEntry))
  check('the entry has a timestamp', isDate(firstEntry?.changedAt), show(firstEntry))
  check(
    'the timestamp is the time of submission',
    isDate(firstEntry?.changedAt) &&
      Math.abs(time(firstEntry.changedAt) - time(createdComplaint.createdAt)) < 5000,
  )
  check('the entry has no admin response', firstEntry?.adminResponse === null, show(firstEntry))
  check('the current status field is still "Pending"', createdComplaint?.status === 'Pending')
  check(
    'the history is saved in the database',
    (await storedHistory(createdComplaint?.id))?.length === 1,
  )

  // ----- 2. Who can see the timeline -----
  section('2. Who can see the timeline')

  const complaint = await makeComplaint(studentA.user)
  const id = String(complaint._id)

  const noToken = await api('GET', `/complaints/${id}`)
  check('no token: 401', noToken.status === 401, `got ${noToken.status}`)

  const owner = await api('GET', `/complaints/${id}`, { token: studentA.token })
  check('owner student: 200', owner.status === 200, `got ${owner.status}`)
  check(
    'owner student sees the history',
    statuses(owner.data?.complaint?.statusHistory).join() === 'Pending',
    show(owner.data?.complaint?.statusHistory),
  )

  const other = await api('GET', `/complaints/${id}`, { token: studentB.token })
  check('another student: 404', other.status === 404, `got ${other.status}`)
  check(
    "another student gets none of the complaint's data",
    !JSON.stringify(other.data).includes('statusHistory'),
  )

  const adminView = await api('GET', `/complaints/${id}`, { token: admin.token })
  check('admin: 200', adminView.status === 200, `got ${adminView.status}`)
  check(
    "admin sees the student's history",
    statuses(adminView.data?.complaint?.statusHistory).join() === 'Pending',
  )

  const studentPatch = await api('PATCH', `/complaints/${id}`, {
    token: studentA.token,
    body: { status: 'Resolved', adminResponse: 'I fixed it myself' },
  })
  check('student cannot PATCH (403)', studentPatch.status === 403, `got ${studentPatch.status}`)
  const otherPatch = await api('PATCH', `/complaints/${id}`, {
    token: studentB.token,
    body: { status: 'Resolved' },
  })
  check('another student cannot PATCH (403)', otherPatch.status === 403, `got ${otherPatch.status}`)
  const anonPatch = await api('PATCH', `/complaints/${id}`, { body: { status: 'Resolved' } })
  check('PATCH without a token: 401', anonPatch.status === 401, `got ${anonPatch.status}`)
  check(
    'refused PATCH requests left the history and status alone',
    (await storedHistory(id))?.length === 1 && (await storedComplaint(id)).status === 'Pending',
  )

  const mine = await api('GET', '/complaints/my', { token: studentA.token })
  const mineItem = mine.data?.complaints?.find((item) => item.id === id)
  check('GET /my includes the history of own complaints', Array.isArray(mineItem?.statusHistory))
  const theirs = await api('GET', '/complaints/my', { token: studentB.token })
  check(
    "GET /my never includes another student's complaint",
    theirs.status === 200 && !theirs.data.complaints.some((item) => item.id === id),
  )

  const studentList = await api('GET', '/complaints', { token: studentA.token })
  check('student cannot use the admin list (403)', studentList.status === 403)
  const adminList = await api('GET', '/complaints', { token: admin.token })
  check(
    'admin list still works and carries the history',
    adminList.status === 200 &&
      adminList.data.complaints.length > 0 &&
      adminList.data.complaints.every((item) => Array.isArray(item.statusHistory)),
  )

  // ----- 3. The timeline follows the PATCH API -----
  section('3. The timeline follows PATCH /api/complaints/:id')

  const step1 = await api('PATCH', `/complaints/${id}`, {
    token: admin.token,
    body: { status: 'In Progress', adminResponse: '  We are looking into this.  ' },
  })
  const afterStep1 = step1.data?.complaint
  check('status change with a response: 200', step1.status === 200, `got ${step1.status}`)
  check('the current status field is updated', afterStep1?.status === 'In Progress')
  check(
    'history now has 2 entries: Pending, In Progress',
    statuses(afterStep1?.statusHistory).join() === 'Pending,In Progress',
    show(afterStep1?.statusHistory),
  )
  const progressEntry = afterStep1?.statusHistory?.[1]
  check('the new entry has a timestamp', isDate(progressEntry?.changedAt), show(progressEntry))
  check(
    'the new entry carries the admin response (trimmed)',
    progressEntry?.adminResponse === 'We are looking into this.',
    show(progressEntry),
  )
  check('the new entry is not older than the first one', isOldestFirst(afterStep1?.statusHistory))
  check(
    'the history is saved in the database',
    statuses(await storedHistory(id)).join() === 'Pending,In Progress',
  )

  const step2 = await api('PATCH', `/complaints/${id}`, {
    token: admin.token,
    body: { status: 'Resolved' },
  })
  const afterStep2 = step2.data?.complaint
  const resolvedEntry = afterStep2?.statusHistory?.[2]
  check('status change without a response: 200', step2.status === 200, `got ${step2.status}`)
  check(
    'history now has 3 entries: Pending, In Progress, Resolved',
    statuses(afterStep2?.statusHistory).join() === 'Pending,In Progress,Resolved',
    show(afterStep2?.statusHistory),
  )
  check(
    'an entry without a response has adminResponse null',
    resolvedEntry?.adminResponse === null,
    show(resolvedEntry),
  )
  check(
    'the complaint keeps its earlier response (existing behaviour)',
    afterStep2?.adminResponse === 'We are looking into this.',
  )
  check('resolvedAt is set (existing behaviour)', isDate(afterStep2?.resolvedAt))
  check('the history is in chronological order', isOldestFirst(afterStep2?.statusHistory))
  check(
    'the current status equals the last history entry',
    afterStep2?.status === afterStep2?.statusHistory?.at(-1)?.status,
  )

  const beforeNoChange = afterStep2?.statusHistory

  const responseOnly = await api('PATCH', `/complaints/${id}`, {
    token: admin.token,
    body: { adminResponse: 'The fan has been replaced.' },
  })
  check(
    'response-only update adds no history entry',
    responseOnly.status === 200 && responseOnly.data.complaint.statusHistory.length === 3,
    show(responseOnly.data?.complaint?.statusHistory),
  )
  check(
    'response-only update still changes the response',
    responseOnly.data?.complaint?.adminResponse === 'The fan has been replaced.',
  )
  check(
    'earlier entries keep the response they were saved with',
    responseOnly.data?.complaint?.statusHistory?.[1]?.adminResponse === 'We are looking into this.',
  )

  const sameStatus = await api('PATCH', `/complaints/${id}`, {
    token: admin.token,
    body: { status: 'Resolved', adminResponse: 'Closing note.' },
  })
  check(
    'sending the current status again adds no history entry',
    sameStatus.status === 200 && sameStatus.data.complaint.statusHistory.length === 3,
    show(sameStatus.data?.complaint?.statusHistory),
  )

  const reopen = await api('PATCH', `/complaints/${id}`, {
    token: admin.token,
    body: { status: 'In Progress', adminResponse: 'Reopened after a recheck.' },
  })
  const afterReopen = reopen.data?.complaint
  check(
    'moving a resolved complaint back adds a new entry',
    statuses(afterReopen?.statusHistory).join() === 'Pending,In Progress,Resolved,In Progress',
    show(afterReopen?.statusHistory),
  )
  check(
    'the new entry carries its response',
    afterReopen?.statusHistory?.at(-1)?.adminResponse === 'Reopened after a recheck.',
  )
  check('resolvedAt is cleared (existing behaviour)', afterReopen?.resolvedAt === null)
  check(
    'earlier entries were not changed (history only grows)',
    show(afterReopen?.statusHistory?.slice(0, 3)) === show(beforeNoChange),
  )

  const reject = await api('PATCH', `/complaints/${id}`, {
    token: admin.token,
    body: { status: 'Rejected', adminResponse: '' },
  })
  const afterReject = reject.data?.complaint
  check(
    'status change with an empty response: entry response is null',
    afterReject?.statusHistory?.at(-1)?.status === 'Rejected' &&
      afterReject.statusHistory.at(-1).adminResponse === null,
    show(afterReject?.statusHistory?.at(-1)),
  )
  check('the complaint response is cleared too', afterReject?.adminResponse === null)

  // ----- 4. Student and admin see the same finished timeline -----
  section('4. Student and admin see the same timeline')

  const studentFinal = await api('GET', `/complaints/${id}`, { token: studentA.token })
  const adminFinal = await api('GET', `/complaints/${id}`, { token: admin.token })
  const studentHistory = studentFinal.data?.complaint?.statusHistory
  check(
    'student sees all 5 entries in order',
    statuses(studentHistory).join() === 'Pending,In Progress,Resolved,In Progress,Rejected',
    show(statuses(studentHistory)),
  )
  check('student sees the response sent with each change', studentHistory?.[1]?.adminResponse === 'We are looking into this.')
  check(
    'admin and student get the same history',
    show(studentHistory) === show(adminFinal.data?.complaint?.statusHistory),
  )
  check('the history is in chronological order', isOldestFirst(studentHistory))
  check(
    'the current status equals the last history entry',
    studentFinal.data?.complaint?.status === studentHistory?.at(-1)?.status,
  )
  check(
    'the history in the database matches',
    show((await storedHistory(id)).map((entry) => entry.status)) === show(statuses(studentHistory)),
  )

  // ----- 5. Bad requests change nothing -----
  section('5. Bad requests do not touch the history')

  const fresh = await makeComplaint(studentA.user)
  const freshId = String(fresh._id)
  const untouched = async () => {
    const stored = await storedComplaint(freshId)
    return stored.status === 'Pending' && stored.statusHistory.length === 1
  }

  const badStatus = await api('PATCH', `/complaints/${freshId}`, {
    token: admin.token,
    body: { status: 'Done' },
  })
  check('unknown status: 400', badStatus.status === 400, `got ${badStatus.status}`)

  const emptyBody = await api('PATCH', `/complaints/${freshId}`, { token: admin.token, body: {} })
  check('empty body: 400', emptyBody.status === 400, `got ${emptyBody.status}`)

  const badResponse = await api('PATCH', `/complaints/${freshId}`, {
    token: admin.token,
    body: { status: 'In Progress', adminResponse: 123 },
  })
  check('response that is not text: 400', badResponse.status === 400, `got ${badResponse.status}`)

  const longResponse = await api('PATCH', `/complaints/${freshId}`, {
    token: admin.token,
    body: { status: 'In Progress', adminResponse: 'x'.repeat(1001) },
  })
  check('response over 1000 characters: 400', longResponse.status === 400, `got ${longResponse.status}`)
  check('none of these requests changed the status or history', await untouched())

  const missing = await api('PATCH', `/complaints/${new mongoose.Types.ObjectId()}`, {
    token: admin.token,
    body: { status: 'In Progress' },
  })
  check('complaint that does not exist: 404', missing.status === 404, `got ${missing.status}`)

  const forged = await api('PATCH', `/complaints/${freshId}`, {
    token: admin.token,
    body: {
      status: 'In Progress',
      statusHistory: [{ status: 'Resolved', changedAt: '2000-01-01T00:00:00.000Z', adminResponse: 'forged' }],
    },
  })
  check(
    'a statusHistory sent in the body is ignored',
    forged.status === 200 &&
      statuses(forged.data.complaint.statusHistory).join() === 'Pending,In Progress' &&
      !JSON.stringify(forged.data.complaint.statusHistory).includes('forged'),
    show(forged.data?.complaint?.statusHistory),
  )

  // ----- 6. Complaints saved before Step 8 -----
  section('6. Complaints saved before Step 8 (no stored history)')

  const submitted = new Date('2026-09-01T10:00:00.000Z')
  const updated = new Date('2026-09-02T12:30:00.000Z')
  const resolved = new Date('2026-09-03T15:45:00.000Z')

  const legacyPendingId = await insertLegacyComplaint(studentA.user, {
    createdAt: submitted,
    updatedAt: submitted,
  })
  const legacyProgressId = await insertLegacyComplaint(studentA.user, {
    status: 'In Progress',
    adminResponse: 'Working on it.',
    createdAt: submitted,
    updatedAt: updated,
  })
  const legacyResolvedId = await insertLegacyComplaint(studentA.user, {
    status: 'Resolved',
    adminResponse: 'All done.',
    resolvedAt: resolved,
    createdAt: submitted,
    updatedAt: resolved,
  })

  const readLegacy = async (legacyId, token = admin.token) =>
    (await api('GET', `/complaints/${legacyId}`, { token })).data?.complaint?.statusHistory

  const pendingHistory = await readLegacy(legacyPendingId)
  check(
    'a Pending complaint shows one entry, at its submission time',
    statuses(pendingHistory).join() === 'Pending' &&
      time(pendingHistory[0].changedAt) === submitted.getTime(),
    show(pendingHistory),
  )

  const progressHistory = await readLegacy(legacyProgressId)
  check(
    'an In Progress complaint shows Pending, then In Progress',
    statuses(progressHistory).join() === 'Pending,In Progress',
    show(progressHistory),
  )
  check(
    'the In Progress entry uses the last update time and the stored response',
    time(progressHistory?.[1]?.changedAt) === updated.getTime() &&
      progressHistory?.[1]?.adminResponse === 'Working on it.',
    show(progressHistory?.[1]),
  )

  const resolvedHistory = await readLegacy(legacyResolvedId)
  check(
    'a Resolved complaint shows Pending, then Resolved at resolvedAt',
    statuses(resolvedHistory).join() === 'Pending,Resolved' &&
      time(resolvedHistory[1].changedAt) === resolved.getTime(),
    show(resolvedHistory),
  )

  check(
    'the owner can read it, another student cannot',
    (await readLegacy(legacyProgressId, studentA.token))?.length === 2 &&
      (await api('GET', `/complaints/${legacyProgressId}`, { token: studentB.token })).status === 404,
  )
  const storedAfterRead = await storedComplaint(legacyProgressId)
  check(
    'reading does not write anything to the database',
    !storedAfterRead.statusHistory || storedAfterRead.statusHistory.length === 0,
    show(storedAfterRead.statusHistory),
  )

  const legacyPatch = await api('PATCH', `/complaints/${legacyProgressId}`, {
    token: admin.token,
    body: { status: 'Resolved', adminResponse: 'Done.' },
  })
  const legacyAfter = legacyPatch.data?.complaint?.statusHistory
  check(
    'first update keeps the starting point and adds the change',
    statuses(legacyAfter).join() === 'Pending,In Progress,Resolved',
    show(legacyAfter),
  )
  check(
    'the starting point keeps its dates',
    time(legacyAfter?.[0]?.changedAt) === submitted.getTime() &&
      time(legacyAfter?.[1]?.changedAt) === updated.getTime(),
    show(legacyAfter),
  )
  check('the new entry carries the response', legacyAfter?.[2]?.adminResponse === 'Done.')
  check(
    'all three entries are now stored in the database',
    statuses(await storedHistory(legacyProgressId)).join() === 'Pending,In Progress,Resolved',
  )

  const legacyResponseOnly = await api('PATCH', `/complaints/${legacyPendingId}`, {
    token: admin.token,
    body: { adminResponse: 'Received.' },
  })
  const pendingStored = await storedHistory(legacyPendingId)
  check(
    'a response-only update saves the starting point without a new entry',
    legacyResponseOnly.status === 200 &&
      statuses(pendingStored).join() === 'Pending' &&
      time(pendingStored[0].changedAt) === submitted.getTime(),
    show(pendingStored),
  )
}

// ---------- start, run, clean up ----------

let server

try {
  await connectDB()
  server = await new Promise((resolve) => {
    const listening = app.listen(0, '127.0.0.1', () => resolve(listening))
  })
  baseUrl = `http://127.0.0.1:${server.address().port}`

  console.log('Step 8: complaint status timeline')
  await run()
} catch (error) {
  failed += 1
  console.error('\nThe test run stopped because of an error:', error)
} finally {
  try {
    await Complaint.deleteMany({ submittedBy: { $in: createdUserIds } })
    await User.deleteMany({ _id: { $in: createdUserIds } })
  } catch (error) {
    console.error('Clean-up failed. Remove users starting with "step8-" by hand:', error.message)
  }
  if (server) await new Promise((resolve) => server.close(resolve))
  await disconnectDB().catch(() => {})
}

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)