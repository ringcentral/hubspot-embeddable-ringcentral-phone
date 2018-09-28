/**
 * use hubspot native UI to show user info
 */
import _ from 'lodash'

export function createContactInfoUIHtml(contact) {
  let {
    firstname,
    lastname,
    name: fullname,
    phoneNumbers,
    emails,
    id,
    portalId
  } = contact
  let email = emails[0] || ''
  let phoneNumber = _.get(phoneNumbers, '[0].phoneNumber')
  return `
  <div class="rc-contact-panel animate rc-hide-contact-panel">
    <div class="private-panel private-panel--right">
      <div class="private-panel__container private-panel__container--with-body private-panel__container--with-header">
        <header class="private-modal__header uiDialogHeader private-panel__header">
          <div class="private-modal__header__inner">
            <h3>
              <span class="private-truncated-string"><span class="private-truncated-string__inner"><span>${fullname}</span></span></span>
              <span title="close" class="rc-close-contact">&times</span>
            </h3>
          </div>
        </header>
        <div class="private-panel__body">
          <div class="is--module p-all-5 panel-background-color-gypsum private-panel__section namespaced-hack-section namespaced-hack-section--vertical UISection__ScrollWrapper-eQImbY MNfNB"
            role="region" tabindex="0">
            <ul data-selenium-test="sidebar" class="uiList private-list--unstyled">
              <li class="uiListItem private-list__item">
                <section>
                  <div class="is--module private-card private-card__wrapper private-card--compact namespaced-hack-section UISection__ScrollWrapper-eQImbY jpCPEv"
                    data-selenium-expanded="true" data-selenium-component="Popoverable(ProfilePropertiesContainer)"
                    data-sidebar-key="Properties">
                    <div class="private-card__section has--vertical-spacing private-card__header">
                      <div class="private-flex Flex__StyledFlex-jcapUM gtkOcp" direction="row" wrap="nowrap">
                        <h5 class="private-card__title"><span data-onboarding="profile-properties-header" data-selenium="profile-properties-header"><span
                              class="private-truncated-string"><span class="private-truncated-string__inner"><span>
                                  <i18n-string data-locale-at-render="zh-cn" data-key="profileSidebarModule.aboutTitleContactfirstname">About
                                  ${fullname}  </i18n-string>
                                </span></span></span></span></h5>
                      </div>
                    </div>
                    <div class="private-card__section has--vertical-spacing">
                      <div class="popover-anchor-container">
                        <!-- react-empty: 167 -->
                        <form data-selenium-test="profile-properties" class="private-form private-floating-form">
                          <div class="is--module namespaced-hack-section UISection__ScrollWrapper-eQImbY jpCPEv">
                            <div class="private-form__set private-form__set--floating floating-field-with-border"
                              data-onboarding="sidebar-property-editor" data-profile-property="firstname"><label for="uid-ctrl-3"
                                class="private-form__label private-form__label--floating"><span class="private-truncated-string private-truncated-string--is-flex"><span
                                    class="private-truncated-string__inner"><span><span aria-describedby="uiTooltip-12"
                                        tabindex="0">First name</span></span></span></span></label>
                              <div class="private-form__set private-form__set--no-label">
                                <div class="private-form__control-wrapper">
                                  <div class="private-form__label-wrapper"></div>
                                  <div class="private-form__input-wrapper"><input readonly type="text"
                                      value="${firstname}" id="uid-ctrl-3" aria-required="false" data-field="firstname"
                                      data-selenium-test="property-input-firstname" autocomplete="off" class="form-control private-form__control private-form__control--inline isInline"></div>
                                  <div class="private-form__meta">
                                    <div class="private-form__messages"></div>
                                  </div>
                                </div>
                              </div>
                              <div class="private-form__control__overlay"><span aria-hidden="true" class="private-icon private-icon__low private-form__control-floating__edit-icon"
                                  style="color: rgb(0, 164, 189); font-size: 0.75rem;">edit</span></div>
                            </div>
                            <div class="private-form__set private-form__set--floating floating-field-with-border"
                              data-onboarding="sidebar-property-editor" data-profile-property="lastname"><label for="uid-ctrl-4"
                                class="private-form__label private-form__label--floating"><span class="private-truncated-string private-truncated-string--is-flex"><span
                                    class="private-truncated-string__inner"><span><span aria-describedby="uiTooltip-13"
                                        tabindex="0">Last name</span></span></span></span></label>
                              <div class="private-form__set private-form__set--no-label">
                                <div class="private-form__control-wrapper">
                                  <div class="private-form__label-wrapper"></div>
                                  <div class="private-form__input-wrapper"><input readonly type="text"
                                      value="${lastname}" id="uid-ctrl-4" aria-required="false" data-field="lastname"
                                      data-selenium-test="property-input-lastname" autocomplete="off" class="form-control private-form__control private-form__control--inline isInline"></div>
                                  <div class="private-form__meta">
                                    <div class="private-form__messages"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div class="private-form__set private-form__set--floating floating-field-with-border"
                              data-onboarding="sidebar-property-editor" data-profile-property="email"><label for="uid-ctrl-5"
                                class="private-form__label private-form__label--floating"><span class="private-truncated-string private-truncated-string--is-flex"><span
                                    class="private-truncated-string__inner"><span><span aria-describedby="uiTooltip-14"
                                        tabindex="0">Email</span></span></span></span></label>
                              <div class="p-x-0 col-xs-12 ">
                                <div class="p-top-1">${email}</div>
                              </div>
                              <div class="private-form__control__overlay"><span aria-hidden="true" class="private-icon private-icon__low private-form__control-floating__edit-icon"
                                  style="color: rgb(0, 164, 189); font-size: 0.75rem;">edit</span><a type="button"
                                  aria-disabled="false" class="uiButton private-button private-button--default private-button__link m-top-1"
                                  href="mailto:${email}" tabindex="0" target="_self"><span aria-hidden="true"
                                    class="private-icon private-icon__low" style="color: rgb(0, 164, 189);">externalLink</span></a></div>
                            </div>
                            <div class="private-form__set private-form__set--floating floating-field-with-border"
                              data-onboarding="sidebar-property-editor" data-profile-property="phone"><label for="uid-ctrl-6"
                                class="private-form__label private-form__label--floating"><span class="private-truncated-string private-truncated-string--is-flex"><span
                                    class="private-truncated-string__inner"><span><span aria-describedby="uiTooltip-15"
                                        tabindex="0">Phone number</span></span></span></span></label><input readonly type="text"
                                value="${phoneNumber}" id="uid-ctrl-6" aria-required="false" data-field="phone"
                                data-selenium-test="property-input-phone" autocomplete="off" class="form-control private-form__control private-form__control--inline isInline">
                              <div class="private-form__control__overlay"><span aria-hidden="true" class="private-icon private-icon__low private-form__control-floating__edit-icon"
                                  style="color: rgb(0, 164, 189); font-size: 0.75rem;">edit</span><a type="button"
                                  aria-disabled="false" class="uiButton private-button private-button--default private-button__link m-top-1"
                                  href="tel:6504377931" tabindex="0" target="_self"><span aria-hidden="true" class="private-icon private-icon__low"
                                    style="color: rgb(0, 164, 189);">externalLink</span></a></div>
                            </div>
                          </div>
                          <div class="m-top-6 text-center"></div>
                        </form>
                      </div>
                    </div>
                  </div>
                </section>
              </li>
            </ul>
          </div>
        </div>
        <footer class="private-modal__footer uiDialogFooter private-panel__footer">
          <div class="UIButtonWrapper__Wrapper-fCEHHA idPthp"><a data-selenium-test="grid-sidebar-container-profile-btn"
              type="button" aria-disabled="false" class="uiButton private-button private-button--default private-button--tertiary private-button--non-link"
              href="/contacts/${portalId}/contact/${id}/" tabindex="0">
              <i18n-string data-locale-at-render="zh-cn" data-key="profileSidebarModule.viewProfile">View record</i18n-string>
            </a></div>
        </footer>
      </div>
    </div>
  </div>
</div>
  `
}
