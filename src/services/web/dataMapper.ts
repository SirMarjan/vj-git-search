import type { AxiosResponse } from 'axios'
import type { Raw } from './api'

export class DataMapper<T extends object> {
  constructor(private fields: (keyof T)[]) {}

  mapRaw(raw: Raw<T>): T {
    const result = {} as Partial<T>
    for (const field of this.fields) {
      if (field in raw) {
        result[field] = raw[field]
      }
    }
    return result as T
  }

  mapRawArray(raws: Raw<T>[]): T[] {
    return raws.map((raw) => this.mapRaw(raw))
  }

  mapResponse(response: AxiosResponse<Raw<T>>): AxiosResponse<T> {
    return {
      ...response,
      data: this.mapRaw(response.data),
    }
  }

  mapResponseArray(response: AxiosResponse<Raw<T>[]>): AxiosResponse<T[]> {
    return {
      ...response,
      data: this.mapRawArray(response.data),
    }
  }
}
