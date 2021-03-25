/**
 * form for create contact
 */

import { Input, Form, Button, Spin } from 'antd'

const FormItem = Form.Item

export default function AddContactForm (props) {
  const [form] = Form.useForm()
  return (
    <div className='rc-add-contact-form'>
      <div className='rc-pd2'>
        <Spin spinning={props.loading}>
          <Form
            layout='vertical'
            form={form}
            name='rc-add-contact-form'
            onFinish={props.onFinish}
            initialValues={props.formData}
          >
            <FormItem
              name='phone'
              label='Number'
              rules={[{ required: true }]}
              required
            >
              <Input />
            </FormItem>
            <FormItem
              name='firstname'
              label='Firstname'
              required
              rules={[{ required: true }]}
            >
              <Input />
            </FormItem>
            <FormItem
              name='lastname'
              label='Lastname'
              required
              rules={[{ required: true }]}
            >
              <Input />
            </FormItem>
            <FormItem
              name='contactEmail'
              label='Email'
              rules={[{ type: 'email' }]}
            >
              <Input />
            </FormItem>
            <Button type='primary' htmlType='submit'>
              Submit
            </Button>
            <Button onClick={props.handleCancel} className='rc-mg1l'>
              Cancel
            </Button>
            <p className='rc-pd1y'>
              * Once contact created, you can manually sync call log from call history
            </p>
          </Form>
        </Spin>
      </div>
    </div>
  )
}
