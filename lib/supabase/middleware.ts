import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { fetchWithTimeout } from '@/lib/supabase/timeout-fetch'

export async function updateSession(request: NextRequest) {
  // Bypass middleware for database error page to prevent redirect loops
  if (request.nextUrl.pathname.startsWith('/database-error')) {
    return NextResponse.next({
      request,
    })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: fetchWithTimeout,
      },
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Guest Redirects
    if (
      !user &&
      !request.nextUrl.pathname.startsWith('/login') &&
      !request.nextUrl.pathname.startsWith('/auth')
    ) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    if (user) {
      // Instantiate Admin client to bypass RLS for profiles read/insert
      const supabaseAdmin = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          global: {
            fetch: fetchWithTimeout,
          },
          cookies: {
            getAll() { return [] },
            setAll() {}
          }
        }
      )

      // 1. Fetch user profile
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('allowed_sections, status')
        .eq('id', user.id)
        .single()

      // 2. Auto-create profile if missing
      let currentProfile = profile
      if (!profile) {
        const admins = ['riznyk111@gmail.com', 'vasylriznykpersonal@gmail.com', 'rdichkovskiy@gmail.com']
        const isAdmin = admins.includes(user.email || '')
        const defaultSections = isAdmin 
          ? ['dashboard', 'projects', 'estimates', 'inventory', 'finance', 'team', 'settings']
          : []

        const newProfile = {
          id: user.id,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'Новий користувач',
          email: user.email || '',
          role: isAdmin ? 'admin' : 'other',
          status: isAdmin ? 'active' : 'pending',
          allowed_sections: defaultSections,
        }

        const { data: insertedData, error: insertError } = await supabaseAdmin
          .from('profiles')
          .insert(newProfile)
          .select()
          .single()

        if (!insertError && insertedData) {
          currentProfile = insertedData
        } else {
          console.error("Error creating profile in middleware:", insertError)
        }
      }

      const pathname = request.nextUrl.pathname
      const isAuthPath = pathname.startsWith('/login') || pathname.startsWith('/auth') || pathname === '/pending'
      const isAsset = pathname.startsWith('/_next') || pathname.startsWith('/favicon.ico') || pathname.includes('.')

      if (!isAuthPath && !isAsset) {
        const status = currentProfile?.status || 'pending'
        const allowedSections = currentProfile?.allowed_sections || []

        // If account is not active, redirect to /pending
        if (status !== 'active') {
          const url = request.nextUrl.clone()
          url.pathname = '/pending'
          return NextResponse.redirect(url)
        }

        // Check specific section permissions
        let requiredSection = ''
        if (pathname === '/') requiredSection = 'dashboard'
        else if (pathname.startsWith('/projects')) requiredSection = 'projects'
        else if (pathname.startsWith('/estimates')) requiredSection = 'estimates'
        else if (pathname.startsWith('/inventory')) requiredSection = 'inventory'
        else if (pathname.startsWith('/finance')) requiredSection = 'finance'
        else if (pathname.startsWith('/team')) requiredSection = 'team'
        else if (pathname.startsWith('/settings')) requiredSection = 'settings'

        if (requiredSection && !allowedSections.includes(requiredSection)) {
          const url = request.nextUrl.clone()
          if (allowedSections.length > 0) {
            const firstAllowed = allowedSections[0]
            url.pathname = firstAllowed === 'dashboard' ? '/' : `/${firstAllowed}`
          } else {
            url.pathname = '/pending'
          }
          return NextResponse.redirect(url)
        }
      }

      // Redirect active users away from login or pending to their first allowed page
      if (pathname.startsWith('/login') || (pathname === '/pending' && currentProfile?.status === 'active' && (currentProfile?.allowed_sections?.length || 0) > 0)) {
        const allowedSections = currentProfile?.allowed_sections || []
        const url = request.nextUrl.clone()
        if (allowedSections.length > 0) {
          const firstAllowed = allowedSections[0]
          url.pathname = firstAllowed === 'dashboard' ? '/' : `/${firstAllowed}`
        } else {
          url.pathname = '/pending'
        }
        return NextResponse.redirect(url)
      }
    }
  } catch (error) {
    console.error("Supabase connection error in middleware:", error)
    const url = request.nextUrl.clone()
    url.pathname = '/database-error'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
