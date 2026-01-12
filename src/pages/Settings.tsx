import React, { useEffect, useState } from 'react';
import { Form, Input, Button, List, Modal, Switch, Select, Card, Popconfirm, message } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, CheckOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { AppSettings, CosConfig, DEFAULT_SETTINGS } from '../types';
import { v4 as uuidv4 } from 'uuid';

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<CosConfig | null>(null);
  const [form] = Form.useForm();
  const [localShortcut, setLocalShortcut] = useState('');
  const { t, i18n } = useTranslation();

  const fetchSettings = async () => {
    const s = await window.picUp.getSettings();
    setSettings(s || DEFAULT_SETTINGS);
    setLocalShortcut(s?.shortcuts?.uploadClipboard || DEFAULT_SETTINGS.shortcuts.uploadClipboard);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (newSettings: AppSettings) => {
    await window.picUp.saveSettings(newSettings);
    setSettings(newSettings);
    message.success(t('settings_saved'));
  };

  const handleAddConfig = () => {
    setEditingConfig(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditConfig = (config: CosConfig) => {
    setEditingConfig(config);
    form.setFieldsValue(config);
    setIsModalVisible(true);
  };

  const handleDeleteConfig = async (id: string) => {
    const newConfigs = settings.cosConfigs.filter(c => c.id !== id);
    const newSettings = { ...settings, cosConfigs: newConfigs };
    if (settings.currentConfigId === id && newConfigs.length > 0) {
      newSettings.currentConfigId = newConfigs[0].id;
    } else if (newConfigs.length === 0) {
      newSettings.currentConfigId = '';
    }
    await handleSaveSettings(newSettings);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      let newConfigs = [...settings.cosConfigs];
      
      if (editingConfig) {
        const index = newConfigs.findIndex(c => c.id === editingConfig.id);
        newConfigs[index] = { ...editingConfig, ...values };
      } else {
        const newConfig = { ...values, id: uuidv4() };
        newConfigs.push(newConfig);
      }

      const newSettings = { 
        ...settings, 
        cosConfigs: newConfigs,
        currentConfigId: settings.currentConfigId || (newConfigs.length > 0 ? newConfigs[0].id : '')
      };
      
      await handleSaveSettings(newSettings);
      setIsModalVisible(false);
    } catch (err) {
      console.error(err);
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div>
      <h2>{t('settings')}</h2>
      
      <Card title={t('general_settings')} style={{ marginBottom: 20 }}>
        <Form layout="vertical">
          <Form.Item label={t('language')}>
            <Select value={i18n.language} onChange={changeLanguage} style={{ width: 120 }}>
              <Select.Option value="zh">中文</Select.Option>
              <Select.Option value="en">English</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label={t('auto_copy')}>
            <Switch checked={settings.autoCopy} onChange={(v) => handleSaveSettings({ ...settings, autoCopy: v })} />
          </Form.Item>
          <Form.Item label={t('copy_format')}>
            <Select value={settings.copyFormat} onChange={(v) => handleSaveSettings({ ...settings, copyFormat: v })}>
              <Select.Option value="markdown">Markdown</Select.Option>
              <Select.Option value="url">URL</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label={t('shortcut_clipboard')}>
            <Input 
              value={localShortcut}
              onChange={(e) => setLocalShortcut(e.target.value)}
              onBlur={() => handleSaveSettings({ ...settings, shortcuts: { ...settings.shortcuts, uploadClipboard: localShortcut } })}
            />
            <div style={{ fontSize: 12, color: '#999' }}>Example: CommandOrControl+Shift+P</div>
          </Form.Item>
        </Form>
      </Card>
      
      <Card title="COS Configurations" extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAddConfig}>{t('add_config')}</Button>}>
        <List
          dataSource={settings.cosConfigs}
          renderItem={item => (
            <List.Item
              actions={[
                item.id !== settings.currentConfigId && (
                  <Button type="link" onClick={() => handleSaveSettings({ ...settings, currentConfigId: item.id })}>
                    {t('use')}
                  </Button>
                ),
                item.id === settings.currentConfigId && <Button type="text" icon={<CheckOutlined />} disabled>{t('active')}</Button>,
                <Button type="text" icon={<EditOutlined />} onClick={() => handleEditConfig(item)} />,
                <Popconfirm title={t('delete_confirm')} onConfirm={() => handleDeleteConfig(item.id)}>
                  <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              ]}
            >
              <List.Item.Meta
                title={item.name}
                description={`${item.bucket} (${item.region}) - ${item.path}`}
              />
            </List.Item>
          )}
        />
      </Card>

      <Modal title={editingConfig ? t('edit_config') : t('add_config')} open={isModalVisible} onOk={handleModalOk} onCancel={() => setIsModalVisible(false)} okText={t('save')} cancelText={t('cancel')}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label={t('name')} rules={[{ required: true }]}>
            <Input placeholder="My Blog Images" />
          </Form.Item>
          <Form.Item name="secretId" label={t('secret_id')} rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="secretKey" label={t('secret_key')} rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="bucket" label={t('bucket')} rules={[{ required: true }]}>
            <Input placeholder="example-1250000000" />
          </Form.Item>
          <Form.Item name="region" label={t('region')} rules={[{ required: true }]}>
            <Input placeholder="ap-shanghai" />
          </Form.Item>
          <Form.Item name="path" label={t('path')} initialValue="images/">
            <Input placeholder="images/" />
          </Form.Item>
          <Form.Item name="customDomain" label={t('custom_domain')}>
            <Input placeholder="https://cdn.example.com" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SettingsPage;
