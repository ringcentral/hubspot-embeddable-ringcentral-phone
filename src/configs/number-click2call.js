/**
 * content config file
 * with proper config,
 * insert `call with ringcentral` button
 * or hover some elemet show call button tooltip
 * or convert phone number text to click-to-call link
 *
 */

// modify phone number text to click-to-call link
export const phoneNumberSelectors = [{
  shouldAct: (href) => {
    return href.includes('/contacts')
  },
  selector: '[data-selenium-test="timeline-editable-section"] b'
}, {
  shouldAct: (href) => {
    return href.includes('/contacts')
  },
  selector: '[data-measured-element="timeline-participant-details-right-content"] span'
}]
