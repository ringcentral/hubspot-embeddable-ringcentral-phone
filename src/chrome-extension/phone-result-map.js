/**
 * map ringcentral phone result to hubspot call status
 */
/* from
Unknown	Call processing result is undefined	Voice call/Fax
Missed	Incoming voice call has been missed	Voice call
Call Accepted	Incoming call is received	Voice call
Voicemail	Incoming call is redirected to voicemail	Voice call
Rejected	Call is declined	Voice call
Reply	Voice reply based on predefined text	Voice call
Received	Incoming fax is received	Fax
Fax Receipt Error	Incoming fax has failed to be received	Fax
Fax on Demand	Sending faxed copy of a document	Fax
Partial Receive	Incoming fax is received partially	Fax
Blocked	Call to/from a blocked number	Voice call
Call connected	Call is connected and conversation is going on	Voice call
No answer	Outgoing call is not answered	Voice call
International Disabled	Call to an international number while International Calling feature is switched off	Voice call
Busy	Phone number is busy	Voice call
Fax Send Error	Outgoing fax sending has failed	Fax
Sent	Outgoing fax is successfully sent	Fax
Call Failed	Outgoing fax has failed because of no answer	Fax
Internal Error	Server error has occurred	Voice call/Fax
IP Phone Offline	RC Digital Line is unregistered	Voice call/Fax
Restricted Number	Call to a restricted number	Voice call
Wrong Number	Outgoing call to an incorrect phone number	Voice call
Stopped	Outgoing fax sending has been stopped	Fax
Suspended Account	Service for account has been stopped	Voice call/Fax
Hang up	Call recipient has hung up the call	Voice call
Abandoned	Call has been lost	Voice call
Declined	Call is not taken (DND status is on)	Voice call
Fax Receipt	Error Internal error occurred when receiving fax	Fax
Fax Send Error	Internal error occurred when sending fax	Fax
*/
/*
CallConnected	Telephony connection has been established and the call is active
NoCall	The call is disconnected
OnHold	The call is put on hold
Ringing	Telephony connection is being established, destination phone is ringing, and source phone receives long tones
ParkedCall	The call is put on hold at one telephone set to be continued from any other telephone set
*/
//to
/*
NOT_STARTED, COMPLETED, IN_PROGRESS, WAITING, or DEFERRED
*/

let dict = {
  NOT_STARTED: 'Unknown,Missed,Rejected,Blocked,No answer,International Disabled,Busy,Fax Send Error,Sent,Call Failed,Internal Error,IP Phone Offline,Restricted Number,Wrong Number,Stopped,Suspended Account,Hang up,Abandoned,Declined,Fax Receipt Error,Fax Send Error',
  COMPLETED: 'Call connected,Call Accepted,Accepted,Voicemail,Reply,Received,Fax on Demand,Partial Receive',
  IN_PROGRESS: '',
  WAITING: ''
}

let keys = Object.keys(dict)

export default (result) => {
  let word = result.toLowerCase()
  for (let k of keys) {
    let v = dict[k].toLowerCase()
    if (v.includes(word)) {
      return k
    }
  }
  return result
}
