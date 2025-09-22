// Shared API types aligned with backend responses

export interface ApiExercise {
  id: string
  name: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface ApiProgramExercise {
  id: string
  kindId?: string
  nameOverride?: string
  setsText: string
  notesText?: string
  rest?: string
  order: number
  createdAt: string
}

export interface ApiProgramWorkout {
  id: string
  name: string
  dayNumber?: number | null
  order: number
  createdAt: string
  exercises: ApiProgramExercise[]
}

export interface ApiProgram {
  id: string
  name: string
  description?: string
  hidden: boolean
  isDefault?: boolean
  createdAt: string
  updatedAt: string
  workouts?: ApiProgramWorkout[]
}

export interface ApiWorkoutSet {
  id: string
  weight?: number | null
  reps?: number | null
  completed: boolean
  rpe?: number | null
  notes?: string | null
  order: number
}

export interface ApiWorkoutExercise {
  id: string
  workoutId: string
  displayName: string
  programExerciseId?: string | null
  kindId?: string | null
  variantId?: string | null
  createdAt: string
  logEntry?: string | null
  completedAt?: string | null
  sets?: ApiWorkoutSet[]
}

export interface ApiWorkout {
  id: string
  name: string
  startedAt?: string | null
  endedAt?: string | null
  note?: string | null
  programWorkoutId?: string | null
  status?: string
  exercises?: ApiWorkoutExercise[]
}
