import { createContext } from 'react'

// Holds { complaints, addComplaint } for the whole app. See ComplaintsProvider.jsx.
export const ComplaintsContext = createContext(null)
