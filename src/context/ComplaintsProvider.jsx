import { useCallback, useEffect, useMemo, useState } from 'react'
import { ComplaintsContext } from './ComplaintsContext'
import { useAuth } from './useAuth'

const API_URL = 'http://localhost:5000/api'

function getToken() {
  return localStorage.getItem('ccp_token')
}

function mapComplaint(complaint) {
  return {
    ...complaint,

    submittedOn: complaint.createdAt || complaint.updatedAt,
submittedBy: {
  id:
    complaint.submittedBy?.id ||
    complaint.submittedBy?._id ||
    complaint.submittedBy ||
    '',
  name: complaint.submittedBy?.name || '',
  department: complaint.submittedBy?.department || '',
},

    attachment: complaint.attachment || null,
    adminResponse: complaint.adminResponse || '',

    history: [
      {
        status: complaint.status,
        date: complaint.createdAt || complaint.updatedAt,
      },
    ],
  }
}

export default function ComplaintsProvider({ children }) {
  const { user } = useAuth()

  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)

  // Load complaints from MongoDB
  const fetchComplaints = useCallback(async () => {
    if (!user) {
      setComplaints([])
      setLoading(false)
      return
    }

    const token = getToken()

    if (!token) {
      setComplaints([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      const response = await fetch(`${API_URL}/complaints/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to load complaints')
      }

      setComplaints(
        (data.complaints || []).map(mapComplaint),
      )
    } catch (error) {
      console.error('Failed to load complaints:', error)
      setComplaints([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchComplaints()
  }, [fetchComplaints])

  // Submit complaint to MongoDB
  const addComplaint = useCallback(
    async ({ title, category, location, description, attachment }) => {
      const token = getToken()

      if (!token) {
        throw new Error('You are not logged in.')
      }

      const response = await fetch(`${API_URL}/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          category,
          description,
          attachment: attachment || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data?.message || 'Failed to submit complaint',
        )
      }

      const complaint = mapComplaint(data.complaint)

      setComplaints((current) => [complaint, ...current])

      return complaint
    },
    [],
  )

  // Admin update will be connected later
  const updateComplaint = useCallback(async () => {
    await fetchComplaints()
  }, [fetchComplaints])

  const value = useMemo(
    () => ({
      complaints,
      loading,
      addComplaint,
      updateComplaint,
    }),
    [complaints, loading, addComplaint, updateComplaint],
  )

  return (
    <ComplaintsContext.Provider value={value}>
      {children}
    </ComplaintsContext.Provider>
  )
}