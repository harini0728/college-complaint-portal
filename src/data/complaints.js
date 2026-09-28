import { COMPLAINT_STATUSES as STATUS } from '../constants/statuses'

// TEMPORARY dummy complaints. The backend replaces this file later.
// Dates are written as YYYY-MM-DD.
const priya = { id: 'CS21B001', name: 'Priya Raman', department: 'Computer Science' }
const arjun = { id: 'CS22B014', name: 'Arjun Nair', department: 'Computer Science' }
const sana = { id: 'EC21B027', name: 'Sana Fathima', department: 'Electronics' }
const rahul = { id: 'ME23B009', name: 'Rahul Verma', department: 'Mechanical' }

export const COMPLAINTS = [
  {
    id: 'CMP-1044',
    title: 'Lab timetable clashes with Data Structures lecture',
    category: 'Academics',
    description:
      'The Tuesday networks lab (2 PM) overlaps with the Data Structures lecture for our section. We are missing one of the two every week.',
    location: 'Computer Science Block, Lab 3',
    submittedOn: '2026-09-26',
    status: STATUS.PENDING,
    adminResponse: '',
    submittedBy: arjun,
  },
  {
    id: 'CMP-1042',
    title: 'Water leakage in Block B washroom',
    category: 'Hostel',
    description:
      'The tap and the pipe below the wash basin have been leaking for a week. The floor stays wet and slippery, especially at night.',
    location: "Girls' Hostel, Block B, 2nd floor",
    submittedOn: '2026-09-24',
    status: STATUS.IN_PROGRESS,
    adminResponse:
      'The plumbing team inspected the washroom on 26 September. Parts have been ordered and the repair is scheduled before 30 September.',
    submittedBy: priya,
  },
  {
    id: 'CMP-1041',
    title: 'Broken benches near the main ground',
    category: 'Infrastructure',
    description:
      'Three benches beside the main ground have broken slats and loose bolts. Someone could get hurt while sitting on them.',
    location: 'Main ground, east side',
    submittedOn: '2026-09-22',
    status: STATUS.IN_PROGRESS,
    adminResponse: 'The maintenance team has taken up the repair work.',
    submittedBy: sana,
  },
  {
    id: 'CMP-1038',
    title: 'Wi-Fi not working in the library reading hall',
    category: 'IT/Network',
    description:
      'The Wi-Fi drops every few minutes in the reading hall on the first floor, so online journals and e-books cannot be used.',
    location: 'Central Library, first floor',
    submittedOn: '2026-09-19',
    status: STATUS.RESOLVED,
    adminResponse:
      'The access point in the reading hall was replaced. Please report again if the problem returns.',
    submittedBy: priya,
  },
  {
    id: 'CMP-1035',
    title: 'Fans not working in Room 118',
    category: 'Infrastructure',
    description:
      'Four of the six ceiling fans in Room 118 do not work. The room is very hot during afternoon classes.',
    location: 'Mechanical Block, Room 118',
    submittedOn: '2026-09-15',
    status: STATUS.RESOLVED,
    adminResponse: 'All four fans were repaired on 18 September.',
    submittedBy: rahul,
  },
  {
    id: 'CMP-1031',
    title: 'Projector not working in Room 204',
    category: 'Infrastructure',
    description:
      'The projector in Room 204 shows a blank screen and the remote does not respond. Faculty are unable to present slides.',
    location: 'Main Block, Room 204',
    submittedOn: '2026-09-12',
    status: STATUS.RESOLVED,
    adminResponse: 'A new projector lamp was fitted and the remote was replaced.',
    submittedBy: priya,
  },
  {
    id: 'CMP-1027',
    title: 'Food quality and hygiene in the canteen',
    category: 'Food/Canteen',
    description:
      'The meals served at lunch have been undercooked for the past few days, and the serving counter is not cleaned between rushes.',
    location: 'Central Canteen',
    submittedOn: '2026-09-08',
    status: STATUS.PENDING,
    adminResponse: '',
    submittedBy: priya,
  },
  {
    id: 'CMP-1024',
    title: 'Lab assistant unavailable during practical hours',
    category: 'Faculty',
    description:
      'No lab assistant is present during the Thursday practical session, so equipment cannot be issued and experiments are delayed.',
    location: 'Electronics Block, Lab 2',
    submittedOn: '2026-09-03',
    status: STATUS.REJECTED,
    adminResponse:
      'A lab assistant was on duty that day according to the attendance register. Please raise it with your lab in-charge if this continues.',
    submittedBy: sana,
  },
  {
    id: 'CMP-1019',
    title: 'Bus route 7 reaches college after the first period',
    category: 'Transport',
    description:
      'Bus route 7 has been arriving about 25 minutes late. Students on this route miss the first period almost every day.',
    location: 'Bus route 7, Gandhipuram stop',
    submittedOn: '2026-08-29',
    status: STATUS.REJECTED,
    adminResponse:
      'Route timings are fixed under the transport contract for this semester. We will review the schedule when it is renewed.',
    submittedBy: priya,
  },
  {
    id: 'CMP-1012',
    title: 'Overflowing dustbins near the Science block',
    category: 'Cleanliness',
    description:
      'The dustbins outside the Science block are not emptied for days and waste is spilling onto the walkway.',
    location: 'Science Block, main entrance',
    submittedOn: '2026-08-21',
    status: STATUS.RESOLVED,
    adminResponse: 'Collection has been increased to twice a day for this area.',
    submittedBy: priya,
  },
]

export function getComplaintsForStudent(studentId) {
  return COMPLAINTS.filter((complaint) => complaint.submittedBy.id === studentId)
}
