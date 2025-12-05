import type { AxiosResponse } from 'axios'
import { gitlabApi, type Raw } from './api'
import { DataMapper } from './dataMapper'
import type { BlobSearchResult, Group, Project, GitFile } from '@/types/types'
import { isNotBlank } from '@/commons/stringUtils'

export const gitlabService = {
  getGroups: async (params: PageableParams): Promise<AxiosResponse<Group[]>> => {
    const groups = await gitlabApi.get<Raw<Group>[]>('/groups', {
      params: {
        ...params,
      },
    })
    return groupMapper.mapResponseArray(groups)
  },

  getGroupsProjects: async (
    groupId: string,
    params: PageableParams,
  ): Promise<AxiosResponse<Project[]>> => {
    const projects = await gitlabApi.get<Raw<Project>[]>(`/groups/${groupId}/projects`, {
      params: {
        ...params,
        include_subgroups: true,
      },
    })
    return projectMapper.mapResponseArray(projects)
  },

  getProjects: async (params: PageableParams): Promise<AxiosResponse<Project[]>> => {
    const projects = await gitlabApi.get<Raw<Project>[]>('/projects', {
      params: {
        ...params,
      },
    })
    return projectMapper.mapResponseArray(projects)
  },

  searchBlobInProjects: async (
    params: PageableParams & {
      projectId: string
      filename?: string
      search?: string
    },
  ): Promise<AxiosResponse<BlobSearchResult[]>> => {
    let search = params.search ?? ''
    console.log('X')
    if (isNotBlank(params.filename)) {
      search += ` filename:${params.filename}`
    }

    const blobSearchResults = await gitlabApi.get<Raw<BlobSearchResult>[]>(
      `/projects/${params.projectId}/search`,
      {
        params: {
          scope: 'blobs',
          search_type: 'advanced',
          search,
        },
      },
    )
    return blobSearchResultMapper.mapResponseArray(blobSearchResults)
  },

  getFile: async (projectId: number, filePath: string): Promise<AxiosResponse<GitFile>> => {
    const file = await gitlabApi.get<Raw<GitFile>>(
      `/projects/${projectId.toFixed()}/repository/files/${encodeURIComponent(filePath)}`,
      {
        params: {
          ref: 'HEAD',
        },
      },
    )
    return gitFileMapper.mapResponse(file)
  },
}

const projectMapper = new DataMapper<Project>([
  'id',
  'name',
  'default_branch',
  'path_with_namespace',
])
const groupMapper = new DataMapper<Group>(['id', 'name', 'full_name', 'full_path'])
const blobSearchResultMapper = new DataMapper<BlobSearchResult>([
  'path',
  'ref',
  'startline',
  'project_id',
])
const gitFileMapper = new DataMapper<GitFile>(['file_name', 'file_path', 'content'])

export interface PageableParams {
  page: number
  per_page: number
}
