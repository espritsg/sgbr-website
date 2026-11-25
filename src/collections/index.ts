import { ApplicationFiles } from './application-files'
import { Events } from './events'
import { Issues } from './issues'
import { Media } from './media'
import { Newsletters } from './newsletters'
import { Pages } from './pages'
import { People } from './people'
import { Posts } from './posts'
import { RateLimits } from './rate-limits'
import { TeamMembers } from './team-members'
import { Topics } from './topics'
import { Users } from './users'

/** Order here is the order in the admin navigation within each group. */
export const collections = [
  Posts,
  People,
  Issues,
  Events,
  Topics,
  TeamMembers,
  Pages,
  Media,
  Newsletters,
  ApplicationFiles,
  RateLimits,
  Users,
]
