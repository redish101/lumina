import { useState, type FormEvent } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../components/button';
import { Field } from '../components/field';
import { FieldGroup } from '../components/field-group';
import { FormError } from '../components/form-error';
import { Input } from '../components/input';
import { RadioGroup } from '../components/radio-group';
import { Select } from '../components/select';
import { Textarea } from '../components/textarea';

const CITIES = [
  { value: 'shanghai', label: '上海' },
  { value: 'beijing', label: '北京' },
  { value: 'shenzhen', label: '深圳' },
];

const CHANNELS = [
  { value: 'email', label: '邮件' },
  { value: 'sms', label: '短信' },
  { value: 'none', label: '不通知' },
];

/** 组合示例：Field / FieldGroup / Select / Textarea / RadioGroup 拼成一张真实表单。 */
function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [note, setNote] = useState('');
  const [channel, setChannel] = useState('email');
  const [submitted, setSubmitted] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('姓名与邮箱都是必填项。');
      setSubmitted('');
      return;
    }
    setError('');
    setSubmitted(`已保存：${name} / ${email} / ${city || '未选城市'} / ${channel}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 480 }}
    >
      <FieldGroup title="基本信息" description="用于创建账号，提交后仍可修改。" columns={2}>
        <Field label="姓名" required>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="张三"
          />
        </Field>
        <Field label="邮箱" required description="用于登录与找回密码">
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
        </Field>
        <Field label="城市" description="决定默认的配送范围">
          <Select
            value={city}
            onChange={(next) => setCity(next)}
            options={CITIES}
            placeholder="请选择城市"
          />
        </Field>
        <RadioGroup
          label="通知方式"
          orientation="horizontal"
          value={channel}
          onChange={(next) => setChannel(next)}
          options={CHANNELS}
        />
        <div style={{ gridColumn: '1 / -1' }}>
          <Field label="备注" description="最多 5 行，超出后内部滚动">
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="还有什么需要我们知道？"
              autoResize
              maxRows={5}
            />
          </Field>
        </div>
      </FieldGroup>

      {error ? <FormError>{error}</FormError> : null}
      {submitted ? (
        <p style={{ margin: 0, color: 'var(--lumina-alias-label-secondary)', fontSize: 13 }}>
          {submitted}
        </p>
      ) : null}

      <div style={{ display: 'flex', gap: 8 }}>
        <Button type="submit" variant="primary">
          创建账号
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setName('');
            setEmail('');
            setCity('');
            setNote('');
            setChannel('email');
            setError('');
            setSubmitted('');
          }}
        >
          重置
        </Button>
      </div>
    </form>
  );
}

const meta = {
  title: 'Patterns/Forms',
  component: SignupForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '表单没有单独的 Form 组件：布局用 FieldGroup，字段用 Field，控件用 Input / Select / Textarea / RadioGroup，' +
          '整体错误用 FormError。所有关联（label 的 htmlFor、aria-describedby、aria-invalid）由 Field 通过 context 自动接好。',
      },
    },
  },
} satisfies Meta<typeof SignupForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: '注册表单',
  render: () => <SignupForm />,
};

export const WithError: Story = {
  name: '提交校验失败',
  render: () => <SignupForm />,
  play: async ({ canvasElement }) => {
    const form = canvasElement.querySelector('form');
    const submit = form?.querySelector('button[type="submit"]');
    if (submit instanceof HTMLElement) submit.click();
  },
};
