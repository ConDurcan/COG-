import React, { useState } from 'react';
import {
  Clipboard,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// ─── Constants ────────────────────────────────────────────────────────────────

const AVATARS = ['🏃', '🚶', '⚡', '🔥', '💪', '🎯', '🏆', '👟'];
const DURATIONS = ['1 Week', '2 Weeks', '1 Month', '3 Months'];
const GOALS = ['Most Steps Wins', 'First to 100K', 'Daily Average', 'Weekly Milestone'];
const LEAGUE_CODE = 'STRIDE-' + Math.random().toString(36).substr(2, 6).toUpperCase();

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FieldLabel = ({ label }: { label: string }) => <Text style={styles.fieldLabel}>{label}</Text>;
const Divider = () => <View style={styles.divider} />;

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LeagueCreator() {
  const [step, setStep] = useState(1);
  const [league, setLeague] = useState({
    name: '',
    avatar: '🏆',
    duration: '1 Week',
    goal: 'Most Steps Wins',
    stepTarget: '10000',
    isPrivate: true,
  });
  const [inviteEmail, setInviteEmail] = useState('');
  const [invites, setInvites] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);

  const handleAddInvite = () => {
    const trimmed = inviteEmail.trim();
    if (trimmed && !invites.includes(trimmed)) {
      setInvites(prev => [...prev, trimmed]);
      setInviteEmail('');
    }
  };

  const handleRemoveInvite = (email:string) => {
    setInvites(prev => prev.filter(i => i !== email));
  };

  const handleCopy = () => {
    Clipboard.setString(LEAGUE_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setStep(1);
    setInvites([]);
    setLeague({
      name: '',
      avatar: '🏆',
      duration: '1 Week',
      goal: 'Most Steps Wins',
      stepTarget: '10000',
      isPrivate: true,
    });
  };

  const progress = (step / 3) * 100;

  const stepTitles = ['League Setup', 'Invite Friends', 'Share & Launch'];
  const titles = ['Create a League', 'Invite Your Crew', 'League is Ready 🎉'];
  const subtitles = [
    'Set up your step challenge',
    'Add friends by email or share the code',
    'Share with friends and start competing',
  ];

  // ── Header ───────────────────────────────────────────────────────────────────

  const Header = () => (
    <View style={styles.header}>
      <Text style={styles.stepLabel}>
        Step {step} of 3 — {stepTitles[step - 1]}
      </Text>
      <Text style={styles.title}>{titles[step - 1]}</Text>
      <Text style={styles.subtitle}>{subtitles[step - 1]}</Text>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <View style={styles.dots}>
        {[1, 2, 3].map(i => (
          <View
            key={i}
            style={[
              styles.dot,
              i === step && styles.dotActive,
              i < step && styles.dotDone,
            ]}
          />
        ))}
      </View>
    </View>
  );

  // ── Step 1 ───────────────────────────────────────────────────────────────────

  const Step1 = () => (
    <>
      <View style={styles.field}>
        <FieldLabel label="League Name" />
        <TextInput
          style={styles.input}
          placeholder="e.g. Office Walkers 2024"
          placeholderTextColor="#3a3a4a"
          value={league.name}
          onChangeText={text => setLeague(prev => ({ ...prev, name: text }))}     />
      </View>

      <View style={styles.field}>
        <FieldLabel label="League Icon" />
        <TouchableOpacity
          style={styles.avatarTrigger}
          onPress={() => setAvatarOpen(!avatarOpen)}
          activeOpacity={0.7}
        >
          <Text style={styles.avatarBig}>{league.avatar}</Text>
          <Text style={styles.avatarText}>Tap to change icon</Text>
          <Text style={styles.avatarChevron}>{avatarOpen ? '▴' : '▾'}</Text>
        </TouchableOpacity>

        {avatarOpen && (
          <View style={styles.avatarGrid}>
            {AVATARS.map(a => (
              <TouchableOpacity
                key={a}
                style={[styles.avatarOpt, league.avatar === a && styles.avatarOptSelected]}
                onPress={() => {
                  setLeague({ ...league, avatar: a });
                  setAvatarOpen(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.avatarOptText}>{a}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.field}>
        <FieldLabel label="Duration" />
        <View style={styles.pillGroup}>
          {DURATIONS.map(d => (
            <TouchableOpacity
              key={d}
              style={[styles.pill, league.duration === d && styles.pillActive]}
              onPress={() => setLeague({ ...league, duration: d })}
              activeOpacity={0.7}
            >
              <Text style={[styles.pillText, league.duration === d && styles.pillTextActive]}>
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <FieldLabel label="Win Condition" />
        <View style={styles.pillGroup}>
          {GOALS.map(g => (
            <TouchableOpacity
              key={g}
              style={[styles.pill, league.goal === g && styles.pillActive]}
              onPress={() => setLeague({ ...league, goal: g })}
              activeOpacity={0.7}
            >
              <Text style={[styles.pillText, league.goal === g && styles.pillTextActive]}>
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <FieldLabel label="Daily Step Target" />
        <TextInput
          style={styles.input}
          placeholder="10000"
          placeholderTextColor="#3a3a4a"
          keyboardType="numeric"
          value={league.stepTarget}
          onChangeText={text => setLeague({ ...league, stepTarget: text })}
        />
      </View>

      <View style={styles.field}>
        <FieldLabel label="Privacy" />
        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.toggleLabel}>Private League</Text>
            <Text style={styles.toggleDesc}>Only invited members can join</Text>
          </View>
          <Switch
            value={league.isPrivate}
            onValueChange={val => setLeague({ ...league, isPrivate: val })}
            trackColor={{ false: '#1e1e2e', true: 'rgba(74,158,255,0.4)' }}
            thumbColor={league.isPrivate ? '#4a9eff' : '#4a4a5a'}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.btnPrimary, !league.name && styles.btnDisabled]}
        onPress={() => league.name && setStep(2)}
        activeOpacity={0.8}
      >
        <Text style={styles.btnPrimaryText}>Continue → Invite Friends</Text>
      </TouchableOpacity>
    </>
  );

  // ── Step 2 ───────────────────────────────────────────────────────────────────

  const Step2 = () => (
    <>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryEmoji}>{league.avatar}</Text>
        <View style={styles.summaryInfo}>
          <Text style={styles.summaryName}>{league.name}</Text>
          <Text style={styles.summaryMeta}>
            {league.duration} · {league.goal}
          </Text>
        </View>
        <View style={styles.memberCount}>
          <Text style={styles.memberNum}>{invites.length + 1}</Text>
          <Text style={styles.memberText}>MEMBERS</Text>
        </View>
      </View>

      <View style={styles.field}>
        <FieldLabel label="Invite by Email" />
        <View style={styles.inviteRow}>
          <TextInput
            style={[styles.input, styles.inviteInput]}
            placeholder="friend@example.com"
            placeholderTextColor="#3a3a4a"
            keyboardType="email-address"
            autoCapitalize="none"
            value={inviteEmail}
            onChangeText={setInviteEmail}
            onSubmitEditing={handleAddInvite}
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleAddInvite} activeOpacity={0.7}>
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        {invites.length > 0 && (
          <View style={styles.chipList}>
            {invites.map(inv => (
              <View key={inv} style={styles.chip}>
                <Text style={styles.chipText}>{inv}</Text>
                <TouchableOpacity onPress={() => handleRemoveInvite(inv)}>
                  <Text style={styles.chipX}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      <Divider />

      <View style={styles.field}>
        <FieldLabel label="Or Share Invite Code" />
        <View style={styles.codeBox}>
          <Text style={styles.codeLabel}>League Code</Text>
          <Text style={styles.codeValue}>{LEAGUE_CODE}</Text>
          <View style={styles.shareBtns}>
            <TouchableOpacity
              style={[styles.shareBtn, copied && styles.shareBtnCopied]}
              onPress={handleCopy}
              activeOpacity={0.7}
            >
              <Text style={[styles.shareBtnText, copied && styles.shareBtnTextCopied]}>
                {copied ? '✓ Copied!' : 'Copy Code'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareBtn} activeOpacity={0.7}>
              <Text style={styles.shareBtnText}>Share Link</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.btnPrimary} onPress={() => setStep(3)} activeOpacity={0.8}>
        <Text style={styles.btnPrimaryText}>
          {invites.length > 0
            ? `Send ${invites.length} Invite${invites.length > 1 ? 's' : ''} & Launch`
            : 'Launch League →'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btnGhost} onPress={() => setStep(1)} activeOpacity={0.7}>
        <Text style={styles.btnGhostText}>← Back</Text>
      </TouchableOpacity>
    </>
  );

  // ── Step 3 ───────────────────────────────────────────────────────────────────

  const Step3 = () => (
    <>
      <View style={styles.successBadge}>
        <Text style={styles.successBadgeText}>✦ League Created Successfully</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryEmoji}>{league.avatar}</Text>
        <View style={styles.summaryInfo}>
          <Text style={styles.summaryName}>{league.name}</Text>
          <Text style={styles.summaryMeta}>
            {league.duration} · {league.goal} · {league.stepTarget} steps/day
          </Text>
        </View>
      </View>

      <View style={styles.field}>
        <FieldLabel label="Your League Code" />
        <View style={styles.codeBox}>
          <Text style={styles.codeLabel}>Share this with friends</Text>
          <Text style={styles.codeValue}>{LEAGUE_CODE}</Text>
          <View style={styles.shareBtns}>
            <TouchableOpacity
              style={[styles.shareBtn, copied && styles.shareBtnCopied]}
              onPress={handleCopy}
              activeOpacity={0.7}
            >
              <Text style={[styles.shareBtnText, copied && styles.shareBtnTextCopied]}>
                {copied ? '✓ Copied!' : '📋 Copy Code'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareBtn} activeOpacity={0.7}>
              <Text style={styles.shareBtnText}>💬 SMS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareBtn} activeOpacity={0.7}>
              <Text style={styles.shareBtnText}>📤 More</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {invites.length > 0 && (
        <View style={styles.field}>
          <FieldLabel label={`Invites Sent (${invites.length})`} />
          <View style={styles.chipList}>
            {invites.map(inv => (
              <View key={inv} style={styles.chipSuccess}>
                <Text style={styles.chipSuccessText}>✓ {inv}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.btnPrimary} onPress={handleReset} activeOpacity={0.8}>
        <Text style={styles.btnPrimaryText}>🏃 Go to League Dashboard</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btnGhost} onPress={handleReset} activeOpacity={0.7}>
        <Text style={styles.btnGhostText}>+ Create Another League</Text>
      </TouchableOpacity>
    </>
  );

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Header />
          <View style={styles.body}>
            {step === 1 && <Step1 />}
            {step === 2 && <Step2 />}
            {step === 3 && <Step3 />}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const C = {
  bg: '#0a0a0f',
  card: '#111118',
  surface: '#0d0d14',
  border: '#1e1e2e',
  blue: '#4a9eff',
  purple: '#a78bfa',
  green: '#22c55e',
  textPrimary: '#f0f0ff',
  textSecondary: '#e8e8f0',
  textMuted: '#9ca3af',
  textFaint: '#6b7280',
  textDim: '#4a4a5a',
  textDark: '#3a3a4a',
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },

  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: C.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.6,
        shadowRadius: 40,
      },
      android: { elevation: 20 },
    }),
  },

  header: {
    backgroundColor: '#16213e',
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 28,
  },
  stepLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 11,
    letterSpacing: 1.5,
    color: C.blue,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: C.textPrimary,
    lineHeight: 32,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: C.textFaint,
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2,
    marginTop: 22,
    overflow: 'hidden',
  },
  progressFill: {
    height: 3,
    borderRadius: 2,
    backgroundColor: C.blue,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dotActive: {
    width: 20,
    borderRadius: 3,
    backgroundColor: C.blue,
  },
  dotDone: {
    backgroundColor: C.purple,
  },

  body: {
    padding: 24,
  },
  field: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    color: C.textFaint,
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  input: {
    width: '100%',
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: C.textSecondary,
  },

  avatarTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  avatarBig: { fontSize: 26 },
  avatarText: { fontSize: 14, color: C.textMuted, flex: 1 },
  avatarChevron: { fontSize: 12, color: C.textDim },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
    gap: 8,
  },
  avatarOpt: {
    width: '22%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarOptSelected: {
    borderColor: C.blue,
    backgroundColor: 'rgba(74,158,255,0.08)',
  },
  avatarOptText: { fontSize: 24 },

  pillGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
  },
  pillActive: {
    borderColor: C.blue,
    backgroundColor: 'rgba(74,158,255,0.12)',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
    color: C.textFaint,
  },
  pillTextActive: {
    color: C.blue,
  },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  toggleLabel: {
    fontSize: 14,
    color: '#c4c4d0',
    fontWeight: '500',
  },
  toggleDesc: {
    fontSize: 12,
    color: C.textDim,
    marginTop: 2,
  },

  btnPrimary: {
    backgroundColor: C.blue,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  btnGhost: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  btnGhostText: {
    color: C.textFaint,
    fontSize: 14,
    fontWeight: '500',
  },

  inviteRow: {
    flexDirection: 'row',
  },
  inviteInput: {
    flex: 1,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderRightWidth: 0,
  },
  addBtn: {
    backgroundColor: 'rgba(74,158,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(74,158,255,0.3)',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: C.blue,
    fontSize: 22,
    fontWeight: '400',
  },

  chipList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 5,
    backgroundColor: 'rgba(99,102,241,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.25)',
    borderRadius: 20,
  },
  chipText: {
    fontSize: 13,
    color: C.purple,
  },
  chipX: {
    fontSize: 17,
    color: C.textFaint,
    lineHeight: 20,
  },
  chipSuccess: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: 'rgba(34,197,94,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.25)',
    borderRadius: 20,
  },
  chipSuccessText: {
    fontSize: 13,
    color: C.green,
  },

  codeBox: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
  },
  codeLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 11,
    color: C.textDim,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  codeValue: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 26,
    fontWeight: '700',
    color: C.blue,
    letterSpacing: 3,
    marginBottom: 16,
  },
  shareBtns: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  shareBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
  },
  shareBtnCopied: {
    borderColor: C.green,
    backgroundColor: 'rgba(34,197,94,0.08)',
  },
  shareBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: C.textMuted,
  },
  shareBtnTextCopied: {
    color: C.green,
  },

  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  summaryEmoji: { fontSize: 34 },
  summaryInfo: { flex: 1 },
  summaryName: {
    fontSize: 17,
    fontWeight: '700',
    color: C.textPrimary,
  },
  summaryMeta: {
    fontSize: 13,
    color: C.textFaint,
    marginTop: 3,
  },
  memberCount: { alignItems: 'center' },
  memberNum: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 22,
    fontWeight: '700',
    color: C.blue,
  },
  memberText: {
    fontSize: 10,
    color: C.textDim,
    letterSpacing: 0.8,
  },

  successBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.25)',
    borderRadius: 20,
    marginBottom: 20,
  },
  successBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.green,
  },

  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 20,
  },
});