import { DailyScheduleEngine } from '../DailyScheduleEngine'
import type { LogSlice } from '../../models/LogSlice'
import { getTemplate, ensureDefaultTemplateExists } from '../TemplateService'
import { DefaultScheduleGenerator } from '../DefaultScheduleGenerator'

jest.mock('../TemplateService', () => ({
  getTemplate: jest.fn(),
  ensureDefaultTemplateExists: jest.fn(),
}))
jest.mock('../DefaultScheduleGenerator', () => ({
  DefaultScheduleGenerator: { generateFromTemplate: jest.fn() },
}))

describe('DailyScheduleEngine', () => {
  const babyId = 'baby1'
  const date = '2025-06-05'
  const DEFAULT_TEMPLATE_ID = 'default'
  const template = { templateId: DEFAULT_TEMPLATE_ID, entries: [] as any[] }
  const slicesMock: LogSlice[] = [
    {
      id: '1',
      babyId,
      category: 'sleep',
      startTime: `${date}T00:00:00.000Z`,
      endTime: `${date}T01:00:00.000Z`,
      createdAt: date,
      updatedAt: date,
      version: 1,
    },
  ]

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('loads existing template and generates slices', async () => {
    ;(getTemplate as jest.Mock).mockResolvedValue(template)
    ;(DefaultScheduleGenerator.generateFromTemplate as jest.Mock).mockReturnValue(slicesMock)

    const slices = await DailyScheduleEngine.generateScheduleForDate({ babyId, date })

    expect(getTemplate).toHaveBeenCalledWith(babyId, DEFAULT_TEMPLATE_ID)
    expect(DefaultScheduleGenerator.generateFromTemplate).toHaveBeenCalledWith({ babyId, dateISO: date, template })
    expect(slices).toEqual(slicesMock)
  })

  it('bootstraps default template when missing', async () => {
    ;(getTemplate as jest.Mock).mockRejectedValue(new Error('not found'))
    ;(ensureDefaultTemplateExists as jest.Mock).mockResolvedValue(undefined)
    ;(getTemplate as jest.Mock).mockResolvedValueOnce(template)
    ;(DefaultScheduleGenerator.generateFromTemplate as jest.Mock).mockReturnValue(slicesMock)

    const slices = await DailyScheduleEngine.generateScheduleForDate({ babyId, date })

    expect(ensureDefaultTemplateExists).toHaveBeenCalledWith(babyId)
    expect(slices).toEqual(slicesMock)
  })
})
