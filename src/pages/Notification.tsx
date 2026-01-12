import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined, CloseOutlined } from '@ant-design/icons'

const Notification: React.FC = () => {
  const [searchParams] = useSearchParams()
  const type = searchParams.get('type') as 'success' | 'error' | 'info'
  const message = searchParams.get('message')
  const url = searchParams.get('url')

  const handleClose = () => {
    window.picUp.closeNotification()
  }

  const handleCopy = () => {
    if (url) {
      window.picUp.openExternal(url)
    }
  }

  const bgColor = type === 'success' ? '#f6ffed' : type === 'error' ? '#fff2f0' : '#e6f7ff'
  const borderColor = type === 'success' ? '#b7eb8f' : type === 'error' ? '#ffccc7' : '#91d5ff'
  const Icon = type === 'success' ? CheckCircleOutlined : type === 'error' ? CloseCircleOutlined : InfoCircleOutlined
  const iconColor = type === 'success' ? '#52c41a' : type === 'error' ? '#ff4d4f' : '#1890ff'

  return (
    <div style={{
      padding: '12px 16px',
      background: bgColor,
      border: `1px solid ${borderColor}`,
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      height: '100%', 
      boxSizing: 'border-box',
      overflow: 'hidden',
      cursor: url ? 'pointer' : 'default',
      position: 'relative',
      userSelect: 'none'
    }} onClick={handleCopy}>
      <div style={{ fontSize: '24px', color: iconColor }}>
        <Icon />
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px', color: '#333' }}>
          {type === 'success' ? 'Upload Successful' : type === 'error' ? 'Upload Failed' : 'Info'}
        </div>
        <div style={{ fontSize: '12px', color: '#666', wordBreak: 'break-all', lineHeight: '1.4' }}>
          {message}
        </div>
      </div>
      <div 
        onClick={(e) => { e.stopPropagation(); handleClose() }} 
        style={{ cursor: 'pointer', color: '#999', padding: '4px' }}
      >
        <CloseOutlined />
      </div>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', WebkitAppRegion: 'drag' } as any} />
    </div>
  )
}

export default Notification
