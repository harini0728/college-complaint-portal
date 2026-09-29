import bcrypt from 'bcryptjs'

// Cost factor 12: slow enough to make brute-forcing expensive, fast enough for logins.
const SALT_ROUNDS = 12

export const hashPassword = (plain) => bcrypt.hash(plain, SALT_ROUNDS)
export const verifyPassword = (plain, hash) => bcrypt.compare(plain, hash)

// A real hash of a throwaway string. Login compares against this when the email
// doesn't exist, so "unknown email" and "wrong password" take the same time and
// an attacker can't use response speed to discover which emails are registered.
export const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', SALT_ROUNDS)
