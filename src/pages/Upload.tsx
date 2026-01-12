import React from 'react';
import { Upload, Button, Card } from 'antd';
import { InboxOutlined, FileImageOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Dragger } = Upload;

const UploadPage: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const { t } = useTranslation();

  const handleClipboardUpload = async () => {
    try {
      setLoading(true);
      await window.picUp.uploadClipboard();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const props = {
    name: 'file',
    multiple: true,
    showUploadList: false,
    customRequest: async (options: any) => {
      const { file, onSuccess, onError } = options;
      try {
        setLoading(true);
        const filePath = (file as any).path;
        if (filePath) {
          await window.picUp.uploadFiles([filePath]);
          onSuccess("ok");
        } else {
          onError(new Error("Cannot get file path"));
        }
      } catch (err: any) {
        onError(err);
      } finally {
        setLoading(false);
      }
    },
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
      <h2>{t('upload_images')}</h2>
      <Card style={{ marginTop: 20 }}>
        <Dragger {...props} style={{ padding: 40 }}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">{t('click_drag')}</p>
        </Dragger>
      </Card>
      
      <div style={{ marginTop: 20 }}>
        <Button 
          type="primary" 
          size="large" 
          icon={<FileImageOutlined />} 
          onClick={handleClipboardUpload}
          loading={loading}
        >
          {t('upload_clipboard')}
        </Button>
      </div>
      
      <div style={{ marginTop: 40, color: '#888' }}>
        <p>{t('shortcut_hint', { shortcut: 'CommandOrControl+Shift+P' })}</p>
      </div>
    </div>
  );
};

export default UploadPage;
