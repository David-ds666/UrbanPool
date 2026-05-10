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
  const [vehicleType, setVehicleType] = useState(userProfile.vehicleType || '');
  const [vehicleColor, setVehicleColor] = useState(userProfile.vehicleColor || '');
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
          setVehicleType(data.profile.vehicleType || '');
          setVehicleColor(data.profile.vehicleColor || '');
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
      vehicleType,
      vehicleColor,
      licenseId,
      city,
    };
    updateProfile(updates);
    setSaving(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(userProfile.name || '');
    setPhone(userProfile.phone ? userProfile.phone.replace('+91 ', '') : '');
    setAvatar(userProfile.avatar || 'avatar1');
    setIsDriver(userProfile.isDriver || false);
    setVehicleNumber(userProfile.vehicleNumber || '');
    setVehicleName(userProfile.vehicleName || '');
    setVehicleType(userProfile.vehicleType || '');
    setVehicleColor(userProfile.vehicleColor || '');
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

          {/* ═══ DRIVER MODE SECTION ═══ */}
          <div className="driver-section">
            <div className="driver-section-header">
              <div className="driver-section-title">
                <span className="driver-icon">🚘</span>
                <div>
                  <h3>Driver Mode</h3>
                  <p>Register as a driver to offer rides</p>
                </div>
              </div>

              {/* VIEW mode — just the badge, nothing else */}
              {!isEditing && (
                <span className={`driver-status-badge ${isDriver ? 'active' : 'inactive'}`}>
                  {isDriver ? '✓ Active' : 'Inactive'}
                </span>
              )}

              {/* EDIT mode — toggle */}
              {isEditing && (
                <button
                  className={`driver-toggle ${isDriver ? 'active' : ''}`}
                  onClick={() => setIsDriver(!isDriver)}
                  aria-label="Toggle driver mode"
                >
                  <span className="driver-toggle-knob" />
                </button>
              )}
            </div>

            {/* EDIT mode — expanded driver details form when toggle is ON */}
            {isEditing && isDriver && (
              <div className="driver-fields">
                <p className="driver-fields-hint">Fill in all fields to activate your driver account.</p>
                <div className="profile-form-grid">

                  {/* Vehicle Name */}
                  <div className="form-group">
                    <label>Vehicle Name</label>
                    <input
                      type="text"
                      value={vehicleName}
                      onChange={e => setVehicleName(e.target.value)}
                      placeholder="e.g. Maruti Swift Dzire"
                    />
                  </div>

                  {/* Vehicle Number */}
                  <div className="form-group">
                    <label>Vehicle Number</label>
                    <input
                      type="text"
                      value={vehicleNumber}
                      onChange={e => setVehicleNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. PB01AB1234"
                    />
                  </div>

                  {/* Vehicle Type */}
                  <div className="form-group">
                    <label>Vehicle Type</label>
                    <select
                      className="profile-select"
                      value={vehicleType}
                      onChange={e => setVehicleType(e.target.value)}
                    >
                      <option value="">Select type...</option>
                      <option value="Hatchback">Hatchback (e.g. Swift, i10)</option>
                      <option value="Sedan">Sedan (e.g. Dzire, Amaze)</option>
                      <option value="SUV">SUV / MUV (e.g. Ertiga, Innova)</option>
                      <option value="Auto">Auto Rickshaw</option>
                      <option value="Bike">Bike / Scooter</option>
                      <option value="Van">Van / Traveller</option>
                    </select>
                  </div>

                  {/* Vehicle Color */}
                  <div className="form-group">
                    <label>Vehicle Color</label>
                    <input
                      type="text"
                      value={vehicleColor}
                      onChange={e => setVehicleColor(e.target.value)}
                      placeholder="e.g. White, Silver, Red"
                    />
                  </div>

                  {/* License ID — full width */}
                  <div className="form-group form-group-full">
                    <label>Driver's Licence Number</label>
                    <input
                      type="text"
                      value={licenseId}
                      onChange={e => setLicenseId(e.target.value.toUpperCase())}
                      placeholder="e.g. PB-0520230012345"
                    />
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
