import React, { useEffect, useState } from 'react';
import { List, Button, Image, Typography, Tooltip, message, Popconfirm } from 'antd';
import { CopyOutlined, LinkOutlined, DeleteOutlined, GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { UploadHistoryItem } from '../types';
import dayjs from 'dayjs';

const { Text } = Typography;

const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<UploadHistoryItem[]>([]);
  const { t } = useTranslation();

  const fetchData = async () => {
    const settings = await window.picUp.getSettings();
    setHistory(settings.uploadHistory || []);
  };

  useEffect(() => {
    fetchData();
    const unsubscribe = window.picUp.onHistoryUpdated(() => {
      fetchData();
    });
    return unsubscribe;
  }, []);

  const handleCopy = (item: UploadHistoryItem, format: 'markdown' | 'url') => {
    const text = format === 'markdown' ? `![${item.fileName}](${item.url})` : item.url;
    navigator.clipboard.writeText(text);
    message.success(t('copied'));
  };

  const handleClearHistory = async () => {
    await window.picUp.clearHistory();
    setHistory([]);
    message.success(t('history_cleared'));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>{t('history')}</h2>
        <Popconfirm title={t('confirm_clear')} onConfirm={handleClearHistory}>
          <Button danger icon={<DeleteOutlined />}>{t('clear_history')}</Button>
        </Popconfirm>
      </div>

      <List
        itemLayout="horizontal"
        dataSource={history}
        pagination={{ pageSize: 10 }}
        renderItem={item => (
          <List.Item
            actions={[
              <Tooltip title={t('copy_markdown')}>
                <Button icon={<CopyOutlined />} onClick={() => handleCopy(item, 'markdown')} />
              </Tooltip>,
              <Tooltip title={t('copy_url')}>
                <Button icon={<LinkOutlined />} onClick={() => handleCopy(item, 'url')} />
              </Tooltip>,
              <Tooltip title={t('open_browser')}>
                <Button icon={<GlobalOutlined />} onClick={() => window.picUp.openExternal(item.url)} />
              </Tooltip>
            ]}
          >
            <List.Item.Meta
              avatar={<Image width={80} src={item.url} style={{ objectFit: 'contain', background: '#eee' }} />}
              title={<Text ellipsis style={{ maxWidth: 300 }}>{item.fileName}</Text>}
              description={
                <div>
                  <div>{dayjs(item.timestamp).format('YYYY-MM-DD HH:mm:ss')}</div>
                  <Text type="secondary" ellipsis style={{ maxWidth: 300 }}>{item.url}</Text>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default HistoryPage;
