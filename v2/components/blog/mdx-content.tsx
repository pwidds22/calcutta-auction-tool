'use client'

import { MDXRemote } from 'next-mdx-remote/rsc'

interface MdxContentProps {
  source: string
}

export function MdxContent({ source }: MdxContentProps) {
  return <MDXRemote source={source} />
}
