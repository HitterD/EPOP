'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Globe } from 'lucide-react'

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
]

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const handleChange = (newLocale: string) => {
    // Remove current locale from pathname
    const segments = pathname.split('/')
    segments[1] = newLocale
    const newPathname = segments.join('/')
    
    router.push(newPathname)
  }

  const currentLanguage = languages.find((lang) => lang.code === locale)

  return (
    <Select value={locale} onValueChange={handleChange}>
      <SelectTrigger className="w-[180px]">
        <Globe className="mr-2 h-4 w-4" />
        <SelectValue>
          {currentLanguage?.flag} {currentLanguage?.name}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {languages.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            <span className="flex items-center gap-2">
              <span>{language.flag}</span>
              <span>{language.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
