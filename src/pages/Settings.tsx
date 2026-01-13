import React, { useEffect, useState, useRef } from 'react';
import { Form, Input, Button, List, Modal, Switch, Select, Card, Popconfirm, message, Tag, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, CheckOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { AppSettings, CosConfig, DEFAULT_SETTINGS } from '../types';
import { v4 as uuidv4 } from 'uuid';

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<CosConfig | null>(null);
  const [form] = Form.useForm();
  const [isRecording, setIsRecording] = useState(false);
  const [tempShortcut, setTempShortcut] = useState<string[]>([]);
  const shortcutInputRef = useRef<HTMLDivElement>(null);
  const { t, i18n } = useTranslation();

  const fetchSettings = async () => {
    const s = await window.picUp.getSettings();
    setSettings(s || DEFAULT_SETTINGS);
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
      const newConfigs = [...settings.cosConfigs];
      
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
    handleSaveSettings({ ...settings, language: lng });
  };

  // Shortcut Recording Logic
  const formatKey = (key: string) => {
    if (key === 'Control') return 'Ctrl';
    if (key === 'Command') return 'Cmd';
    if (key === ' ') return 'Space';
    if (key === 'ArrowUp') return 'Up';
    if (key === 'ArrowDown') return 'Down';
    if (key === 'ArrowLeft') return 'Left';
    if (key === 'ArrowRight') return 'Right';
    return key.length === 1 ? key.toUpperCase() : key;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isRecording) return;
    e.preventDefault();
    e.stopPropagation();

    if (e.key === 'Enter') {
      saveShortcut();
      return;
    }

    if (e.key === 'Escape') {
      setIsRecording(false);
      setTempShortcut([]);
      return;
    }

    // Build combination
    const keys = new Set<string>();
    if (e.ctrlKey) keys.add('Ctrl');
    if (e.metaKey) keys.add('Cmd'); // Electron maps CmdOrCtrl
    if (e.altKey) keys.add('Alt');
    if (e.shiftKey) keys.add('Shift');
    
    // Add main key if it's not a modifier
    if (!['Control', 'Meta', 'Alt', 'Shift'].includes(e.key)) {
       keys.add(formatKey(e.key));
    }

    const keyArray = Array.from(keys);
    if (keyArray.length <= 3) {
      setTempShortcut(keyArray);
    }
  };

  const saveShortcut = async () => {
    if (tempShortcut.length < 2) {
      message.error(t('shortcut_error'));
      return;
    }
    const shortcutString = tempShortcut.join('+').replace('Ctrl', 'CommandOrControl').replace('Cmd', 'CommandOrControl');
    await handleSaveSettings({ 
      ...settings, 
      shortcuts: { ...settings.shortcuts, uploadClipboard: shortcutString } 
    });
    setIsRecording(false);
  };

  const startRecording = () => {
    setIsRecording(true);
    setTempShortcut([]);
    setTimeout(() => shortcutInputRef.current?.focus(), 100);
  };

  const resetShortcut = async () => {
     await handleSaveSettings({ 
      ...settings, 
      shortcuts: { ...settings.shortcuts, uploadClipboard: DEFAULT_SETTINGS.shortcuts.uploadClipboard } 
    });
  };

  const displayShortcut = isRecording ? tempShortcut : (settings.shortcuts.uploadClipboard || '').replace('CommandOrControl', 'Ctrl').split('+').filter(Boolean);

  return (
    <div>
      <h2>{t('settings')}</h2>

      <Card 
        title={t('cos_configs')} 
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAddConfig}>{t('add_config')}</Button>}
        style={{ marginBottom: 20 }}
      >
        <List
          dataSource={settings.cosConfigs}
          renderItem={item => (
            <List.Item
              actions={[
                item.id === settings.currentConfigId ? <span style={{ color: 'green' }}><CheckOutlined /> {t('active')}</span> : <Button type="link" onClick={() => handleSaveSettings({ ...settings, currentConfigId: item.id })}>{t('use')}</Button>,
                <Button type="link" icon={<EditOutlined />} onClick={() => handleEditConfig(item)}>{t('edit')}</Button>,
                <Popconfirm title={t('delete_confirm')} onConfirm={() => handleDeleteConfig(item.id)}>
                  <Button type="link" danger icon={<DeleteOutlined />}>{t('delete')}</Button>
                </Popconfirm>
              ]}
            >
              <List.Item.Meta
                title={item.name}
                description={`${item.bucket} / ${item.path}`}
              />
            </List.Item>
          )}
        />
      </Card>
      
      <Card title={t('general_settings')} style={{ marginBottom: 20 }}>
        <Form layout="vertical">
          <Form.Item label={t('language')}>
            <Select value={i18n.language.startsWith('zh') ? 'zh' : 'en'} onChange={changeLanguage} style={{ width: 120 }}>
              <Select.Option value="zh">中文</Select.Option>
              <Select.Option value="en">English</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label={t('auto_copy')}>
            <Switch checked={settings.autoCopy} onChange={(v) => handleSaveSettings({ ...settings, autoCopy: v })} />
          </Form.Item>
          <Form.Item label={t('copy_format')}>
            <Select value={settings.copyFormat} onChange={(v) => handleSaveSettings({ ...settings, copyFormat: v })} style={{ width: 120 }}>
              <Select.Option value="markdown">Markdown</Select.Option>
              <Select.Option value="url">URL</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label={t('shortcut_clipboard')}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
               <div 
                 ref={shortcutInputRef}
                 tabIndex={0}
                 onClick={startRecording}
                 onKeyDown={handleKeyDown}
                 onBlur={() => {
                    if (isRecording && tempShortcut.length >= 2) {
                       saveShortcut();
                    } else if (isRecording) {
                       setIsRecording(false);
                    }
                 }}
                 style={{ 
                   border: `1px solid ${isRecording ? '#1890ff' : '#d9d9d9'}`, 
                   padding: '4px 11px', 
                   borderRadius: 6, 
                   minWidth: 200,
                   minHeight: 32,
                   cursor: 'text',
                   display: 'flex',
                   alignItems: 'center',
                   flexWrap: 'wrap',
                   gap: 4,
                   background: '#fff',
                   boxShadow: isRecording ? '0 0 0 2px rgba(24, 144, 255, 0.2)' : 'none',
                   outline: 'none',
                   transition: 'all 0.3s'
                 }}
               >
                 {displayShortcut.length > 0 ? (
                    displayShortcut.map((key, index) => (
                      <Tag key={index} color="blue" style={{ marginRight: 0 }}>{key}</Tag>
                    ))
                 ) : (
                    <span style={{ color: '#ccc' }}>{isRecording ? '' : t('click_to_record')}</span>
                 )}
                 {isRecording && tempShortcut.length === 0 && <span style={{ color: '#999', fontSize: 12 }}>{t('recording')}</span>}
               </div>
               
               {isRecording && tempShortcut.length >= 2 && (
                 <Button type="primary" size="small" icon={<CheckOutlined />} onClick={saveShortcut} />
               )}

               <Tooltip title={t('reset_default')}>
                 <Button icon={<ReloadOutlined />} onClick={resetShortcut} />
               </Tooltip>
             </div>
             <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                {t('shortcut_hint', { shortcut: 'Ctrl+Shift+P' })}
             </div>
          </Form.Item>
        </Form>
      </Card>

      <Modal
        title={editingConfig ? t('edit_config') : t('add_config')}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label={t('name')} rules={[{ required: true }]}>
            <Input />
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
          <Form.Item name="path" label={t('path')} initialValue="">
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
