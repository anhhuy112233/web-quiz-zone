import React, { useState } from 'react';
import { getAuthHeaders } from '../../utils/api';
import Button from '../common/Button';
import Alert from '../common/Alert';

const ImportExcel = ({ onQuestionsImported, onClose }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Vui lòng chọn file Excel/CSV');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:5000/api/exams/parse-excel', {
        method: 'POST',
        headers: {
          'Authorization': getAuthHeaders().Authorization,
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Lỗi xử lý file');
      }

      setPreview(data.data);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = () => {
    if (preview && preview.questions) {
      onQuestionsImported(preview.questions);
      onClose();
    }
  };

  const downloadTemplate = () => {
    const template = [
      ['Câu hỏi', 'Lựa chọn A', 'Lựa chọn B', 'Lựa chọn C', 'Lựa chọn D', 'Đáp án đúng', 'Giải thích'],
      ['1 + 1 = ?', '1', '2', '3', '4', 'B', '1 + 1 = 2'],
      ['Thủ đô của Việt Nam là?', 'Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Huế', 'A', 'Hà Nội là thủ đô của Việt Nam']
    ];

    const csvContent = template.map(row => row.join(',')).join('\n');
    
    // Thêm BOM để đảm bảo UTF-8 encoding
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_cau_hoi.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Import câu hỏi từ Excel/CSV</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {error && <Alert type="error" message={error} className="mb-4" />}

        <div className="space-y-4">
          {/* File upload section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="space-y-2">
                <div className="text-4xl">📁</div>
                <div className="text-lg font-medium">
                  {file ? file.name : 'Chọn file Excel/CSV'}
                </div>
                <div className="text-sm text-gray-500">
                  Hỗ trợ: .xlsx, .xls, .csv (tối đa 5MB)
                </div>
              </div>
            </label>
          </div>

          {/* Template download */}
          <div className="text-center">
            <Button
              type="button"
              variant="outline"
              onClick={downloadTemplate}
            >
              📥 Tải template mẫu
            </Button>
          </div>

          {/* Upload button */}
          {file && (
            <div className="text-center">
              <Button
                onClick={handleUpload}
                loading={loading}
                disabled={!file}
              >
                {loading ? 'Đang xử lý...' : 'Xử lý file'}
              </Button>
            </div>
          )}

          {/* Preview section */}
          {preview && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✅</span>
                  <span className="font-medium text-green-800">
                    Đã xử lý thành công {preview.totalQuestions} câu hỏi
                  </span>
                </div>
                {preview.errors && (
                  <div className="mt-2 text-sm text-red-600">
                    <div className="font-medium">Các lỗi gặp phải:</div>
                    <ul className="list-disc list-inside mt-1">
                      {preview.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Questions preview */}
              <div className="max-h-96 overflow-y-auto">
                <h3 className="font-medium mb-2">Xem trước câu hỏi:</h3>
                {preview.questions.map((question, index) => (
                  <div key={index} className="border rounded-lg p-3 mb-3">
                    <div className="font-medium mb-2">
                      Câu {index + 1}: {question.question}
                    </div>
                    <div className="space-y-1 text-sm">
                      {question.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className={`pl-2 ${
                            optIndex === question.correctAnswer
                              ? 'text-green-600 font-medium'
                              : 'text-gray-600'
                          }`}
                        >
                          {String.fromCharCode(65 + optIndex)}. {option}
                          {optIndex === question.correctAnswer && ' ✓'}
                        </div>
                      ))}
                    </div>
                    {question.explanation && (
                      <div className="mt-2 text-sm text-gray-500">
                        <strong>Giải thích:</strong> {question.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Import button */}
              <div className="flex justify-end space-x-3">
                <Button variant="secondary" onClick={onClose}>
                  Hủy
                </Button>
                <Button onClick={handleImport}>
                  Import {preview.totalQuestions} câu hỏi
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportExcel; 