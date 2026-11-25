/**
 * Order of issues everywhere (website, feed for espritsg.ch): newest year first, within
 * a year the issue created last first. The migration creates the issues of the old
 * feed in reverse order, so the old order within a year stays the same.
 */
export const ISSUE_SORT = ['-year', '-createdAt']
