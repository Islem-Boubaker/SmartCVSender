import React, { useState } from 'react';
import { Upload, Mail, FileText, Send } from 'lucide-react';


function SendEmails() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    cvFile: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFormData(prev => ({
        ...prev,
        cvFile: file
      }));
      setStatus("");
    } else {
      setStatus("❌ Veuillez sélectionner un fichier PDF valide.");
      e.target.value = '';
    }
  };

  const handleSend = async () => {
    if (!formData.subject.trim()) {
      setStatus("❌ Le sujet est requis.");
      return;
    }
    if (!formData.message.trim()) {
      setStatus("❌ Le message est requis.");
      return;
    }
    if (!formData.cvFile) {
      setStatus("❌ Veuillez télécharger un fichier CV.");
      return;
    }

    setLoading(true);
    setStatus("Envoi des emails en cours...");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('subject', formData.subject);
      formDataToSend.append('message', formData.message);
      formDataToSend.append('cv', formData.cvFile);

      const response = await fetch("http://localhost:5000/send-emails", {
        method: 'POST',
        body: formDataToSend
      });

      const result = await response.json();

      if (result.success) {
        const successMsg = `✅ ${result.sent} emails envoyés avec succès sur ${result.total}`;
        const failedMsg = result.failed > 0 ? ` (${result.failed} échecs)` : '';
        setStatus(successMsg + failedMsg);

        setFormData({
          subject: '',
          message: '',
          cvFile: null
        });
        document.getElementById('cv-upload').value = '';
      } else {
        setStatus(`❌ ${result.message || "Échec de l'envoi des emails."}`);
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Erreur lors de l'envoi des emails.");
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <div className="header">
        <h2>
          <Mail size={28} />
          📨 Campagne Email
        </h2>
        <p>Envoyez votre CV par email avec un message personnalisé</p>
      </div>

      <div className="form-group">
        <label htmlFor="subject">
          <FileText size={18} />
          Sujet de l'email *
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleInputChange}
          placeholder="Ex: Candidature pour le poste de développeur..."
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="message">
          <Mail size={18} />
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleInputChange}
          placeholder="Rédigez votre message de candidature...&#10;&#10;Exemple:&#10;Madame, Monsieur,&#10;&#10;Je vous soumets ma candidature pour un poste au sein de votre entreprise.&#10;&#10;Cordialement,"
          rows={6}
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="cv-upload">
          <Upload size={18} />
          Télécharger votre CV (PDF) *
        </label>
        <div className="upload-area">
          <input
            type="file"
            id="cv-upload"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={loading}
          />
          <label htmlFor="cv-upload">
            <Upload size={32} />
            {formData.cvFile ? (
              <span className="file-selected">
                ✅ {formData.cvFile.name}
              </span>
            ) : (
              <>
                <span>Cliquez pour télécharger votre CV</span>
                <span className="note">Format PDF uniquement - Max 5MB</span>
              </>
            )}
          </label>
        </div>
      </div>

      <button 
        onClick={handleSend} 
        disabled={loading} 
        className="send-button"
      >
        {loading ? (
          <>
            <span className="spinner"></span>
            Envoi en cours...
          </>
        ) : (
          <>
            <Send size={20} />
            Envoyer les emails
          </>
        )}
      </button>

      {status && (
        <div className={`status ${status.includes('✅') ? 'success' : 'error'}`}>
          <p>{status}</p>
        </div>
      )}
    </div>
  );
}

export default SendEmails;