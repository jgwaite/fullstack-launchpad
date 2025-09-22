// Core data structures for workout tracking

export interface ExerciseEntry {
  id: string
  timestamp: number
  raw: string // freeform text description of reps/sets
}

export interface Exercise {
  id: string
  name: string
  entries: ExerciseEntry[]
  // Future: structured data like sets, reps, weight will be extracted from description
}

export interface Workout {
  id: string
  startedAt: Date
  endedAt?: Date
  exercises: Exercise[]
  status: 'active' | 'completed' | 'paused'
}

// For fuzzy matching exercise names
export interface ExerciseTemplate {
  id: string
  name: string
  category?: string
  lastUsed?: Date
  useCount: number
}

// Future structures for progression
export interface Set {
  reps: number
  weight?: number
  rpe?: number // Rate of Perceived Exertion
  restTime?: number
  intensifiers?: string[] // "drop set", "rest-pause", "cluster", etc.
  targetReps?: string // "8-12", "AMRAP", "to failure", etc.
  notes?: string // freeform notes for this specific set
}

export interface StructuredExercise extends Exercise {
  sets: Set[]
  // Exercise-level properties (apply to all sets unless overridden)
  defaultTargetReps?: string
  equipment?: string // "barbell", "dumbbell", "cable", etc.
}