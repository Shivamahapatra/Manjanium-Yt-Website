'use client'

import React from 'react'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Play } from 'lucide-react'
import Link from 'next/link'

export const F1PreviewCard = () => {
  return (
    <Card title="Interactive F1 Hub">
      <div className="space-y-4">
        <div className="aspect-video bg-gradient-to-br from-surface-alt to-surface rounded-lg flex items-center justify-center group cursor-pointer hover:from-accent/20 hover:to-secondary/20 transition-standard">
          <Play className="w-12 h-12 text-accent opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-standard" />
        </div>
        <Link href="/f1">
          <Button variant="primary" size="sm" className="w-full">
            View Live Session
          </Button>
        </Link>
      </div>
    </Card>
  )
}
