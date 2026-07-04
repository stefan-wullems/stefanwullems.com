export type ScreenElement = {}
export type EventElement = {}
// A command can only touch one aggregate
export type CommandElement = {}
export type AutomationElement = {}
export type ReadModelElement = {}
export type Element =
  | ScreenElement
  | EventElement
  | CommandElement
  | AutomationElement
  | ReadModelElement

type ScreenInteractionSlice = {
  screen: ScreenElement
  command: CommandElement
  events: EventElement[]
}

type StateTransformSlice = {
  events: EventElement[]
  readModel: ReadModelElement
}

// When should you use multiple read models for a slice?
// The best use case is when each read model is populated by a different aggregate
// If all the events are from the same aggregate, we may as well extend the readmodel
type StateViewSlice = {
  readModels: ReadModelElement[]
  screen: ScreenElement
}

// Can be tested with given then for the entire slice with input and output events, or with given when then on the command, should be identical
type ProcessorSlice = {
  readModels: ReadModelElement[]
  processor: AutomationElement
  command: CommandElement
  events: EventElement[]
}

type TranslationSlice = {
  externalEvent: EventElement
  translator: AutomationElement
  command: CommandElement
  events: EventElement[]
}

type NotificationSlice = {
  readModels: ReadModelElement[]
  listener: AutomationElement
}

// type ScreenInteractionSlice = {
//   screen: ScreenElement
//   command: CommandElement
//   events: EventElement[]
// }

// type StateProjectionSlice = {
//   events: EventElement[]
//   readModel: ReadModelElement
// }

// type StateViewSlice = {
//   readModels: ReadModelElement[]
//   target: ScreenElement
// }

// type ProcessStateSlice = {
//   readModels: ReadModelElement[]
//   processor: AutomationElement
//   command: CommandElement
//   events: EventElement[]
// }

// type ExternalEventSlice = {
//   event: EventElement
//   translator: AutomationElement
//   command: CommandElement
//   events: EventElement[]
// }

// type ThirdPartyIntegrationSlice = {}
