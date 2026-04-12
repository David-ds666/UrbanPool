import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AVATAR_OPTIONS from '../../utils/avatars';
import './Profile.css';

export default function Profile() {
  const { user, userProfile, updateProfile } = useAuth();

  // ── Local form state ──
  const [name, setName] = useState(userProfile.name || '');
  const [phone, setPhone] = useState(
    userProfile.phone ? userProfile.phone.replace('+91 ', '') : ''
  );
  const [avatar, setAvatar] = useState(userProfile.avatar || 'avatar1');
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // ── Driver fields ──
  const [isDriver, setIsDriver] = useState(userProfile.isDriver || false);
  const [vehicleNumber, setVehicleNumber] = useState(userProfile.vehicleNumber || '');
  const [vehicleName, setVehicleName] = useState(userProfile.vehicleName || '');
  const [licenseId, setLicenseId] = useState(userProfile.licenseId || '');
  const [city, setCity] = useState(userProfile.city || '');

  // ── Stats from backend ──
  const [stats, setStats] = useState({ totalRides: 0, memberSince: '—', avgRating: 4.9, reviewCount: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch(`http://localhost:5001/api/profile/${user.uid}`)
      .then(res => res.json())
      .then(data => {
        if (data.stats) setStats(data.stats);
        if (data.profile) {
          setName(data.profile.name || '');
          setPhone(data.profile.phone ? data.profile.phone.replace('+91 ', '') : '');
          setAvatar(data.profile.avatar || 'avatar1');
          setIsDriver(data.profile.isDriver || false);
          setVehicleNumber(data.profile.vehicleNumber || '');
          setVehicleName(data.profile.vehicleName || '');
          setLicenseId(data.profile.licenseId || '');
          setCity(data.profile.city || '');
        }
      })
      .catch(console.error);
  }, [user]);

  // Sync local state when context changes
  useEffect(() => {
    if (userProfile.name && !name) setName(userProfile.name);
    if (userProfile.avatar) setAvatar(userProfile.avatar);
  }, [userProfile]);

  const currentAvatar = AVATAR_OPTIONS.find(a => a.id === avatar) || AVATAR_OPTIONS[0];

  const handleSave = async () => {
    setSaving(true);
    const updates = {
      name,
      phone: phone ? `+91 ${phone}` : '',
      avatar,
      isDriver,
      vehicleNumber,
      vehicleName,
      licenseId,
      city,
    };
    updateProfile(updates);
    setSaving(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset to current profile values
    setName(userProfile.name || '');
    setPhone(userProfile.phone ? userProfile.phone.replace('+91 ', '') : '');
    setAvatar(userProfile.avatar || 'avatar1');
    setIsDriver(userProfile.isDriver || false);
    setVehicleNumber(userProfile.vehicleNumber || '');
    setVehicleName(userProfile.vehicleName || '');
    setLicenseId(userProfile.licenseId || '');
    setCity(userProfile.city || '');
    setIsEditing(false);
    setShowAvatarPicker(false);
  };

  return (
    <div className="profile-container">
      {/* ═══ MAIN PROFILE CARD ═══ */}
      <div className="profile-card">
        <div className="profile-header">
          {/* Avatar */}
          <div className="profile-image-section">
            <div
              className="profile-avatar-circle"
              style={{ background: currentAvatar.bg }}
              onClick={() => isEditing && setShowAvatarPicker(!showAvatarPicker)}
            >
              <span className="profile-avatar-emoji">{currentAvatar.emoji}</span>
              {isEditing && <div className="avatar-edit-badge">✎</div>}
            </div>

            {/* Avatar Picker */}
            {showAvatarPicker && (
              <div className="avatar-picker-dropdown">
                <p className="avatar-picker-title">Choose Avatar</p>
                <div className="avatar-picker-grid">
                  {AVATAR_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      className={`avatar-option ${avatar === opt.id ? 'selected' : ''}`}
                      style={{ background: opt.bg }}
                      onClick={() => { setAvatar(opt.id); setShowAvatarPicker(false); }}
                      title={opt.label}
                    >
                      {opt.emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <h1>{isEditing ? 'Edit Profile' : (name || 'Your Profile')}</h1>
          {!isEditing && <p className="profile-subtitle">{user?.email}</p>}
        </div>

        {/* ═══ FORM FIELDS ═══ */}
        <div className="profile-form">
          <div className="profile-form-grid">
            {/* Name */}
            <div className="form-group">
              <label>Full Name</label>
              {isEditing ? (
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" />
              ) : (
                <p className="display-text">{name || '—'}</p>
              )}
            </div>

            {/* Email */}
            <div className="form-group">
              <label>Email Address</label>
              <p className="display-text display-readonly">{user?.email}</p>
            </div>

            {/* Phone */}
            <div className="form-group">
              <label>Phone Number</label>
              {isEditing ? (
                <div className="profile-phone-input">
                  <span className="profile-phone-prefix">+91</span>
                  <input
                    type="tel"
                    value={phone}
                    maxLength={10}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter phone number"
                  />
                </div>
              ) : (
                <p className="display-text">{userProfile.phone || 'Not added yet'}</p>
              )}
            </div>

            {/* City */}
            <div className="form-group">
              <label>City</label>
              {isEditing ? (
                <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Chandigarh" />
              ) : (
                <p className="display-text">{city || 'Not added yet'}</p>
              )}
            </div>
          </div>

          {/* ═══ DRIVER INFO SECTION ═══ */}
          <div className="driver-section">
            <div className="driver-section-header" onClick={() => isEditing && setIsDriver(!isDriver)}>
              <div className="driver-section-title">
                <span className="driver-icon">🚘</span>
                <div>
                  <h3>Driver Mode</h3>
                  <p>Add vehicle details to offer rides</p>
                </div>
              </div>
              {isEditing && (
                <button className={`driver-toggle ${isDriver ? 'active' : ''}`} onClick={e => { e.stopPropagation(); setIsDriver(!isDriver); }}>
                  <span className="driver-toggle-knob" />
                </button>
              )}
              {!isEditing && (
                <span className={`driver-status-badge ${isDriver ? 'active' : 'inactive'}`}>
                  {isDriver ? '✓ Active' : 'Inactive'}
                </span>
              )}
            </div>

            {isDriver && (
              <div className="driver-fields">
                <div className="profile-form-grid">
                  <div className="form-group">
                    <label>Vehicle Name</label>
                    {isEditing ? (
                      <input type="text" value={vehicleName} onChange={e => setVehicleName(e.target.value)} placeholder="e.g. Maruti Dzire" />
                    ) : (
                      <p className="display-text">{vehicleName || '—'}</p>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Vehicle Number</label>
                    {isEditing ? (
                      <input type="text" value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value.toUpperCase())} placeholder="e.g. PB01AB1234" />
                    ) : (
                      <p className="display-text">{vehicleNumber || '—'}</p>
                    )}
                  </div>
                  <div className="form-group">
                    <label>License ID</label>
                    {isEditing ? (
                      <input type="text" value={licenseId} onChange={e => setLicenseId(e.target.value.toUpperCase())} placeholder="e.g. PB-0520230012345" />
                    ) : (
                      <p className="display-text">{licenseId || '—'}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ═══ ACTIONS ═══ */}
          <div className="profile-actions">
            {isEditing ? (
              <>
                <button className="profile-save-btn" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button className="profile-cancel-btn" onClick={handleCancel}>Cancel</button>
              </>
            ) : (
              <button className="profile-edit-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
            )}
          </div>
        </div>
      </div>

      {/* ═══ STATS ROW ═══ */}
      <div className="profile-stats-row">
        <div className="stat-card">
          <span className="stat-icon">📅</span>
          <div>
            <p className="stat-label">Member Since</p>
            <p className="stat-value">{stats.memberSince}</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🚗</span>
          <div>
            <p className="stat-label">Total Rides</p>
            <p className="stat-value">{stats.totalRides}</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">⭐</span>
          <div>
            <p className="stat-label">Rating</p>
            <p className="stat-value">{stats.avgRating}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
