import type { Meta, StoryObj } from '@storybook/react';
import { ConfirmDialog } from './confirm-dialog';

const meta: Meta<typeof ConfirmDialog> = {
  title: 'Components/ConfirmDialog',
  component: ConfirmDialog,
  args: {
    title: 'Delete workout',
    description: 'This action cannot be undone.',
    triggerLabel: 'Open dialog',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
  },
};

export default meta;

type Story = StoryObj<typeof ConfirmDialog>;

export const Default: Story = {};

export const CustomTrigger: Story = {
  args: {
    title: 'Log out',
    description: 'Are you sure you want to log out?',
    confirmLabel: 'Log out',
    cancelLabel: 'Stay',
    trigger: <button>Custom trigger</button>,
  },
};
