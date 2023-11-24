import React, { useState, useRef,useEffect } from 'react';
import { Button } from '@mui/material';
import { useTreeState, useSelectedNodeState } from '../../contexts';
import { style } from './Button';

export const ImportFamilyDriveBtn = () => {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);
  const [data, setData] = useTreeState();
  const [selectedNode, setSelectedNode] = useSelectedNodeState();

  const handleFileUpload = (file) => {
    const fr = new FileReader();
    fr.onload = function (e) {
      try {
        const result = JSON.parse(e.target.result);
        const formatted = JSON.stringify(result, null, 2);
        result.value = formatted;

        setData(result);
        setSelectedNode(result);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        alert('Invalid JSON file');
      } finally {
        setIsUploading(false);
      }
    };

    fr.readAsText(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      handleFileUpload(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setIsUploading(true);
      handleFileUpload(file);
    }
  };

  const handleGoogleDriveImport = () => {
    window.gapi.load('client:auth2:picker', initClient);
  };

  const initClient = () => {
    window.gapi.client
      .init({
        apiKey: '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',
        clientId: '923579770694-r66471il4ud84510ikob98ffqbd6g1vr.apps.googleusercontent.com',
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
        scope: 'https://www.googleapis.com/auth/drive.file',
        plugin_name: 'Web client 2',
      })
      .then(() => {
        return window.gapi.auth2.getAuthInstance().signIn();
      })
      .then(() => {
        window.gapi.client.load('drive', 'v3');
        window.gapi.load(
         'picker',
         {'callback': openFilePicker()}
      );
        
      })
      .catch((error) => {
        console.error('Error initializing Google Drive API:', error);
      });
  };

  const handlePickerResult = (data) => {
    if (data.action === window.google.picker.Action.PICKED) {
       const file = data.docs[0];
       console.log(`The user selected the file: ${file.name}`);
       window.gapi.client.drive.files.get({
        fileId: file.id,
        alt: 'media',
      })
        .then((response) => {
          const jsonContent = response.body;
          setData(JSON.parse(jsonContent));
          setSelectedNode(JSON.parse(jsonContent));
          setIsUploading(false);
        })
        .catch((error) => {
          console.error('Error fetching JSON file:', error);
        });
    } else if (data.action === window.google.picker.Action.CANCEL) {
       console.log('Picker canceled');
    }
   };

   const openFilePicker = () => {
    const picker = new window.google.picker.PickerBuilder()
       .addView(window.google.picker.ViewId.DOCS)
       .setOAuthToken(gapi.auth.getToken().access_token)
       .setCallback(handlePickerResult)
       .build();
    picker.setVisible(true);
   };
  
 
  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <input
        id="upload"
        ref={inputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleInputChange}
      />
      <Button sx={style} onClick={handleGoogleDriveImport} disabled={isUploading}>
        Import from Google Drive
      </Button>
    </div>
  );
};
