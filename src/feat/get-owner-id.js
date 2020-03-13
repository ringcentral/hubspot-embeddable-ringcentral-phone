/**
 * get owner id
 */

/*
get https://api.hubspot.com/owners/v2/owners?portalId=4920570&clienttimeout=14000&includeSignature=false

{"extensions":null,"data":{"viewer":{"ownerId":45206791,"__typename":"ViewerOperations"},"crmObject":{"id":25751,"defaultProperties":{"email":{"id":"NDkyMDU3MCwwLTEsMjU3NTEsZW1haWw=","value":"zxdong@gmail.com","__typename":"PropertyValue"},"firstname":{"id":"NDkyMDU3MCwwLTEsMjU3NTEsZmlyc3RuYW1l","value":"Xudong","__typename":"PropertyValue"},"hs_avatar_filemanager_key":{"id":"NDkyMDU3MCwwLTEsMjU3NTEsaHNfYXZhdGFyX2ZpbGVtYW5hZ2VyX2tleQ==","value":null,"__typename":"PropertyValue"},"jobtitle":{"id":"NDkyMDU3MCwwLTEsMjU3NTEsam9idGl0bGU=","value":null,"__typename":"PropertyValue"},"lastname":{"id":"NDkyMDU3MCwwLTEsMjU3NTEsbGFzdG5hbWU=","value":"ZHAO","__typename":"PropertyValue"},"__typename":"DefaultContactProperties","hubspot_owner_id":{"id":"NDkyMDU3MCwwLTEsMjU3NTEsaHVic3BvdF9vd25lcl9pZA==","value":"33620723","__typename":"PropertyValue"},"hubspot_team_id":{"id":"NDkyMDU3MCwwLTEsMjU3NTEsaHVic3BvdF90ZWFtX2lk","value":null,"__typename":"PropertyValue"}},"defaultAssociations":{"toCompanies":{"edges":[],"__typename":"CompanyConnection"},"__typename":"DefaultAssociations"},"__typename":"Contact"},"__typename":"Query"}}

*/
import {
  host
} from 'ringcentral-embeddable-extension-common/src/common/helpers'
import fetch from 'ringcentral-embeddable-extension-common/src/common/fetch'
import { commonFetchOptions, getPortalId } from './common'
import _ from 'lodash'

export default async (id, type = 'CONTACT') => {
  let url = `${host}/api-passthrough/graphql/crm?portalId=${getPortalId()}&clienttimeout=15000`
  let opts = commonFetchOptions()
  const data = {
    operationName: 'Sidebar_Query',
    query: 'query Sidebar_Query($objectType:String!$subjectId:Long!$isPreview:Boolean!$isVisit:Boolean=false){viewer{ownerId __typename}crmObject(type:$objectType id:$subjectId)@skip(if:$isVisit){id ...Highlight_Fields ...PreviewPanel_Fields@include(if:$isPreview)...Permissions_Fields __typename}__typename}fragment Highlight_Fields on CrmObject{...on Contact{id defaultProperties{email{id value __typename}firstname{id value __typename}hs_avatar_filemanager_key{id value __typename}jobtitle{id value __typename}lastname{id value __typename}__typename}defaultAssociations{toCompanies(first:1){edges{node{id defaultProperties{name{id value __typename}__typename}__typename}__typename}__typename}__typename}}...on Company{id defaultProperties{domain{id value __typename}hs_avatar_filemanager_key{id value __typename}name{id value __typename}__typename}}__typename}fragment PreviewPanel_Fields on CrmObject{...on Contact{defaultProperties{firstname{id value __typename}lastname{id value __typename}hubspot_owner_id{id value __typename}hubspot_team_id{id value __typename}__typename}}...on Company{defaultProperties{name{id value __typename}domain{id value __typename}hubspot_owner_id{id value __typename}hubspot_team_id{id value __typename}__typename}}...on Deal{defaultProperties{dealname{id value __typename}hubspot_owner_id{id value __typename}hubspot_team_id{id value __typename}__typename}}...on FeedbackSubmission{defaultProperties{hs_survey_type{id value __typename}__typename}}...on Ticket{defaultProperties{subject{id value __typename}hubspot_owner_id{id value __typename}hubspot_team_id{id value __typename}__typename}}__typename}fragment Permissions_Fields on CrmObject{...on Company{defaultProperties{hubspot_owner_id{id value __typename}hubspot_team_id{id value __typename}__typename}}...on Contact{defaultProperties{hubspot_owner_id{id value __typename}hubspot_team_id{id value __typename}__typename}}...on Deal{defaultProperties{hubspot_owner_id{id value __typename}hubspot_team_id{id value __typename}__typename}}...on Ticket{defaultProperties{hubspot_owner_id{id value __typename}hubspot_team_id{id value __typename}__typename}}__typename}',
    variables: {
      subjectId: id,
      objectType: type,
      isPreview: false
    }
  }
  let res = await fetch.post(url, data, opts)
  return _.get(res, 'data.viewer.ownerId')
}
