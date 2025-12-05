import type { Group, Project } from '@/types/types'

export function getProjectsInGroups(groups: Group[], allProjects: Project[]): Project[] {
  return allProjects.filter((project) =>
    groups.some((group) => project.path_with_namespace.startsWith(group.full_path + '/')),
  )
}

export function collapseGroups(groups: Group[]): Group[] {
  const groupsWithPaths = groups.map((it) => {
    return {
      group: it,
      splitPath: it.full_path.split('/'),
    }
  })
  return groupsWithPaths
    .filter((current) => {
      return !groupsWithPaths.some((other) => {
        return (
          other.splitPath.length < current.splitPath.length &&
          other.splitPath.every((segment, index) => segment === current.splitPath[index])
        )
      })
    })
    .map((item) => item.group)
}

export function isGroupsProject(groups: Group[], project: Project): boolean {
  return groups.some((group) => project.path_with_namespace.startsWith(group.full_path + '/'))
}
