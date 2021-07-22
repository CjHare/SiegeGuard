import {EmittedEventHandler} from './emitted-event-handler'
import {ErrorHandler} from '../error-handler'

export interface EventListener {
  on<T>(operation: string, delegate: EmittedEventHandler<T>): EventListener
  on(operation: string, error: ErrorHandler): EventListener
}
