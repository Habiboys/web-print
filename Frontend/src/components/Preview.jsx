import { useState } from "react";
import PropTypes from "prop-types"; // pastikan PropTypes di-import

const Preview = ({ fileUrl }) => {
  const [loading, setLoading] = useState(true);

  const onLoadHandler = () => {
    setLoading(false);
  };

  if (!fileUrl) {
    return (
      <div className="text-center p-4 border rounded bg-gray-50">
        Belum ada file yang dipilih
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-white">
      {loading && (
        <div className="flex justify-center items-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent"></div>
        </div>
      )}

      <div className="flex justify-center">
        <iframe
          src={fileUrl}
          width="100%"
          height="600px"
          frameBorder="0"
          onLoad={onLoadHandler}
        ></iframe>
      </div>
    </div>
  );
};

// Menambahkan validasi untuk props
Preview.propTypes = {
  fileUrl: PropTypes.string.isRequired, // Menandakan bahwa 'fileUrl' adalah properti wajib
};

export default Preview;
