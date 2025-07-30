// source/src/components/common/MarkdownEditor.js
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MarkdownEditor = ({ 
  value, 
  onChange, 
  placeholder = "Enter your text here...", 
  maxLength = 3000,
  disabled = false,
  error = ''
}) => {
  const [activeTab, setActiveTab] = useState('write');

  const handleTextChange = (e) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  return (
    <div className="markdown-editor">
      {/* Tab Navigation */}
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'write' ? 'active' : ''}`}
            type="button"
            onClick={() => setActiveTab('write')}
            disabled={disabled}
          >
            <i className="fas fa-edit me-1"></i>
            Write
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'preview' ? 'active' : ''}`}
            type="button"
            onClick={() => setActiveTab('preview')}
            disabled={disabled}
          >
            <i className="fas fa-eye me-1"></i>
            Preview
          </button>
        </li>
      </ul>

      {/* Content Area */}
      <div className="tab-content border border-top-0 rounded-bottom">
        {/* Write Tab */}
        {activeTab === 'write' && (
          <div className="tab-pane active p-3">
            <textarea
              className={`form-control border-0 ${error ? 'is-invalid' : ''}`}
              value={value}
              onChange={handleTextChange}
              placeholder={placeholder}
              rows={10}
              style={{ 
                resize: 'vertical', 
                minHeight: '200px',
                boxShadow: 'none'
              }}
              disabled={disabled}
            />
            
            {/* Markdown Toolbar */}
            <div className="markdown-toolbar mt-2">
              <small className="text-muted">
                <strong>Markdown supported:</strong> 
                <code>**bold**</code>, 
                <code>*italic*</code>, 
                <code>`code`</code>, 
                <code>```code block```</code>,
                <code>[link](url)</code>,
                <code>- list</code>
              </small>
            </div>
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <div className="tab-pane active p-3 markdown-preview">
            {value.trim() ? (
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  // Custom styling for preview
                  code: ({node, inline, className, children, ...props}) => {
                    return inline ? (
                      <code className="bg-light px-1 rounded" {...props}>
                        {children}
                      </code>
                    ) : (
                      <pre className="bg-light p-2 rounded">
                        <code {...props}>{children}</code>
                      </pre>
                    );
                  },
                  blockquote: ({children}) => (
                    <blockquote className="border-start border-3 ps-3 text-muted">
                      {children}
                    </blockquote>
                  ),
                  table: ({children}) => (
                    <table className="table table-striped">{children}</table>
                  )
                }}
              >
                {value}
              </ReactMarkdown>
            ) : (
              <div className="text-muted fst-italic">
                Nothing to preview. Write some content in the Write tab.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;