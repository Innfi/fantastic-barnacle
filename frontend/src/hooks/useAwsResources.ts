import { useState, useEffect } from 'react'
import type { AwsTopology } from '@/types/aws'

interface UseAwsResourcesResult {
  topology: AwsTopology | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useAwsResources(region: string = 'ap-northeast-2'): UseAwsResourcesResult {
  const [topology, setTopology] = useState<AwsTopology | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/resources?region=${region}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: AwsTopology = await res.json()
      setTopology(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [region])

  return { topology, loading, error, refetch: fetchData }
}
