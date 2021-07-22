import {Router} from 'express'

export interface Routes {
  /**
   * Creates the set of end points mmappings to controllers.
   *
   * @param router receives the set of end point mappings.
   */
  addTo(router: Router): void
}
