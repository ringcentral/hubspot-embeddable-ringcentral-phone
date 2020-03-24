/**
 * meeting select UI
 */

import { Component } from 'react'
import { AutoComplete, Select, Spin, Button } from 'antd'
import {
  search
} from 'ringcentral-embeddable-extension-common/src/common/db'
import dayjs from 'dayjs'
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

export async function doSyncMeeting (contact, meetingInfo) {
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
  console.debug('sync meeting result', res)
  if (res && res.engagement) {
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
    show: false,
    fetching: false,
    options: [],
    data: {},
    contact: {},
    syncing: false,
    value: undefined
  }

  componentDidMount () {
    window.addEventListener('message', e => {
      if (e && e.data && e.data.path === '/meetingLoggerForward') {
        this.setState({
          data: e.data,
          show: true
        })
      }
    })
    this.fetch()
  }

  handleSync = async () => {
    const {
      displayName,
      startTime,
      duration,
      hostInfo,
      participants // ,
      // recordings
    } = this.state.data.body.meeting
    const ps = participants
      .map(d => d.displayName)
      .join(', ')
    const body = `
<p>Host: ${hostInfo.displayName || 'unknow'}</p>
<p>Participants: ${ps}</p>`

    const start = dayjs(startTime).valueOf()
    const end = start + duration
    const meetingInfo = {
      title: displayName,
      body,
      startTime: start,
      endTime: end
    }
    this.setState({
      syncing: true
    })
    await doSyncMeeting(this.state.contact, meetingInfo)
    this.setState({
      syncing: false
    })
  }

  handleCancel = () => {
    this.setState({
      show: false
    })
  }

  handleSelect = (v, s) => {
    this.setState({
      contact: JSON.parse(s.props.json),
      value: s.props.fullName
    })
  }

  handleChange = v => {
    this.setState({
      value: v
    })
  }

  fetch = _.debounce(async (v) => {
    const res = await search(v)
    this.setState({
      options: res
    })
  }, 200)

  renderItem = item => {
    return (
      <Option
        key={item.id}
        value={item.id}
        json={JSON.stringify(item)}
        fullName={item.name}
      >
        <p>{item.name}</p>
      </Option>
    )
  }

  render () {
    const { value, show, fetching, options, contact, syncing } = this.state
    if (!show) {
      return null
    }
    const props = {
      value,
      placeholder: 'Search contact by name or number',
      autoFocus: true,
      onSearch: this.fetch,
      showSearch: true,
      loading: fetching,
      onSelect: this.handleSelect,
      onChange: this.handleChange,
      getPopupContainer: () => document.getElementById('rc-meeting-select'),
      style: {
        width: '100%'
      },
      notFoundContent: fetching ? <Spin size='small' /> : null
    }
    return (
      <div className='rc-meet-wrap'>
        <Spin spinning={syncing}>
          <div className='rc-meet-wrap-inner'>
            <h2>Sync Meeting to HubSpot</h2>
            <p className='pd1y'>Select Contact:</p>
            <AutoComplete {...props}>
              {
                options.map(this.renderItem)
              }
            </AutoComplete>
            <div className='rc-pd1y'>
              <Button
                type='primary'
                disabled={!contact.id}
                onClick={this.handleSync}
              >
                Sync
              </Button>
              <Button
                onClick={this.handleCancel}
                className='rc-mg1l'
              >
                Cancel
              </Button>
            </div>
          </div>
        </Spin>
      </div>
    )
  }
}
