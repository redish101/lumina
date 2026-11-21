import type { Meta, StoryObj } from '@storybook/react-vite';
import { FormError } from './form-error';

const meta = {
  title: 'Components/FormError',
  component: FormError,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    message: '两次输入的密码不一致',
  },
  argTypes: {
    message: {
      control: 'text',
      description: '错误文案；与 children 二选一',
    },
    children: {
      control: false,
      description: '自定义错误内容，message 缺省时使用',
    },
    className: {
      control: false,
      description: '追加在最外层容器上的类名',
    },
  },
} satisfies Meta<typeof FormError>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 最常用的表单级错误条，出现时会被读屏立即播报。 */
export const Default: Story = {};

/** `children` 适合放链接、加粗等自定义内容，优先级低于 `message`。 */
export const WithChildren: Story = {
  render: () => (
    <FormError>
      <strong>保存失败：</strong>请检查网络后重试
    </FormError>
  ),
};

/** 长文案会自动折行，容器保持左对齐与固定内边距。 */
export const LongMessage: Story = {
  args: {
    message:
      '该邮箱已被注册。如果你忘记了密码，可以先通过邮箱验证码登录，再在账号设置里重新设置密码。',
  },
  render: (args) => (
    <div style={{ width: 360 }}>
      <FormError {...args} />
    </div>
  ),
};

/** 没有错误内容时组件返回 null，可以不写条件分支直接挂载。 */
export const NoMessage: Story = {
  render: () => (
    <div style={{ width: 320, fontSize: 14, lineHeight: '22px' }}>
      <p style={{ margin: 0 }}>当前没有错误，下面不会渲染任何错误条。</p>
      <FormError />
    </div>
  ),
};
