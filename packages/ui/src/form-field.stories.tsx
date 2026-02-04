import type { Meta, StoryObj } from '@storybook/react';
import { FormField } from './form-field';
import { Input } from './input';
import { Select } from './select';

const meta: Meta<typeof FormField> = {
  title: 'Components/FormField',
  component: FormField,
};

export default meta;

type Story = StoryObj<typeof FormField>;

export const InputField: Story = {
  render: () => (
    <FormField label="이메일" required hint="업무용 이메일을 입력하세요.">
      <Input placeholder="name@company.com" />
    </FormField>
  ),
};

export const SelectField: Story = {
  render: () => (
    <FormField label="권한">
      <Select defaultValue="user">
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </Select>
    </FormField>
  ),
};

export const ErrorState: Story = {
  render: () => (
    <FormField label="비밀번호" error="8자 이상 입력하세요.">
      <Input type="password" />
    </FormField>
  ),
};
