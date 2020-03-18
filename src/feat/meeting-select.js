/**
 * meeting select UI
 */

import { Component } from 'react'
import { Select, Spin, Button } from 'antd'
import {
  search
} from 'ringcentral-embeddable-extension-common/src/common/db'
import _ from 'lodash'
/**
 * sync meeting from rc to hs
 */

import fetchBg from 'ringcentral-embeddable-extension-common/src/common/fetch-with-background'

import getOwnerId from './get-owner-id'
import { getCompanyId, notifySyncSuccess } from './log-sync'
import { commonFetchOptions, getPortalId, getEmail } from './common'
import { thirdPartyConfigs } from 'ringcentral-embeddable-extension-common/src/common/app-config'

let {
  apiServerHS
} = thirdPartyConfigs

export async function doSyncMeeting () {
  const contact = {}
  const meetingInfo = {}
  const { title, body, endTime, startTime } = meetingInfo
  let { id: contactId, isCompany } = contact
  const type = isCompany ? 'COMPANY' : 'CONTACT'
  let email = getEmail()
  let ownerId = await getOwnerId(contact.id, type)
  let now = +new Date()
  let contactIds = isCompany ? [] : [Number(contactId)]
  let companyId = isCompany
    ? contactId
    : await getCompanyId(contactId)
  let data = {
    engagement: {
      source: 'CRM_UI',
      ownerId,
      type: 'MEETING',
      sourceId: email,
      timestamp: now
    },
    associations: {
      contactIds,
      companyIds: companyId ? [Number(companyId)] : [],
      dealIds: [],
      ownerIds: [],
      ticketIds: []
    },
    attachments: [
    ],
    scheduledTasks: [
    ],
    inviteeEmails: [
    ],
    metadata: {
      title,
      body,
      endTime,
      startTime,
      source: 'CRM_UI'
    }
  }
  let portalId = getPortalId()
  let url = `${apiServerHS}/engagements/v1/engagements/?portalId=${portalId}&clienttimeout=14000`
  let res = await fetchBg(url, {
    method: 'post',
    body: data,
    headers: {
      ...commonFetchOptions().headers,
      'X-Source': 'CRM_UI',
      'X-SourceId': email
    }
  })
  console.log(res)
  if (res) {
    notifySyncSuccess({
      id: contactId,
      logType: 'MEETING',
      interactionType: '',
      isCompany
    })
  }
}

const { Option } = Select

export default class App extends Component {
  state = {
    show: true,
    fetching: false,
    options: [],
    selected: [],
    syncing: false
  }

  componentDidMount () {
    window.addEventListener('message', e => {
      if (e && e.data && e.data.path === '/meetingLogger') {
        this.setState({
          show: true
        })
      }
    })
  }

  handleSync = () => {

  }

  onChange = v => {
    console.log(v)
  }

  fetch = _.debounce(async (v) => {
    const res = await search(v)
    this.setState({
      options: res
    })
  }, 200)

  renderItem = item => {
    return (
      <Option value={item.id}>
        {item.firstname} {item.lastname}
      </Option>
    )
  }

  render () {
    const { show, fetching, options, selected, syncing } = this.state
    if (!show) {
      return null
    }
    const props = {
      placeholder: 'Search contact by name or number',
      allowClear: true,
      autoFocus: true,
      mode: 'multiple',
      onSearch: this.fetch,
      onChange: this.onChange,
      notFoundContent: fetching ? <Spin size='small' /> : null
    }
    return (
      <Spin spinning={syncing}>
        <div className='rc-meet-wrap'>
          <h3>Select contact who joined the meeting</h3>
          <Select {...props}>
            {
              options.map(this.renderItem)
            }
          </Select>
          <div className='rc-pd1y'>
            <Button
              type='primary'
              disabled={!selected.length}
              onClick={this.handleSync}
            >
              Sync
            </Button>
          </div>
        </div>
      </Spin>
    )
  }
}
