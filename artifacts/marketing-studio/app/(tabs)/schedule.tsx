import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { fonts, spacing, radius, platformColors } from "@/constants/theme";
import { fetchScheduledPosts } from "@/lib/api";

const c = Colors.light;

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getWeekDates(offset: number) {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });
}

function isSameDay(d1: Date, d2: Date) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export default function ScheduleTab() {
  const insets = useSafeAreaInsets();
  const webTop = Platform.OS === "web" ? 67 : 0;
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["scheduled-posts"],
    queryFn: fetchScheduledPosts,
  });

  const dayPosts = useMemo(
    () =>
      posts.filter((p) => isSameDay(new Date(p.scheduledAt), selectedDate)),
    [posts, selectedDate]
  );

  const today = new Date();

  const monthLabel = weekDates[0]
    ? weekDates[0].toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTop }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Schedule</Text>
        <Text style={styles.headerSubtitle}>Plan & manage posts</Text>
      </View>

      <View style={styles.calendarHeader}>
        <Pressable onPress={() => setWeekOffset((o) => o - 1)}>
          <Feather name="chevron-left" size={22} color={c.text} />
        </Pressable>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <Pressable onPress={() => setWeekOffset((o) => o + 1)}>
          <Feather name="chevron-right" size={22} color={c.text} />
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {weekDates.map((date, i) => {
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, today);
          const hasPosts = posts.some((p) =>
            isSameDay(new Date(p.scheduledAt), date)
          );
          return (
            <Pressable
              key={i}
              style={[
                styles.dayCell,
                isSelected && styles.dayCellSelected,
              ]}
              onPress={() => setSelectedDate(date)}
            >
              <Text
                style={[
                  styles.dayLabel,
                  isSelected && styles.dayLabelSelected,
                ]}
              >
                {DAYS[date.getDay()]}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  isSelected && styles.dayNumberSelected,
                  isToday && !isSelected && styles.dayNumberToday,
                ]}
              >
                {date.getDate()}
              </Text>
              {hasPosts && <View style={[styles.dayDot, isSelected && styles.dayDotSelected]} />}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.dayHeader}>
        <Text style={styles.dayHeaderText}>
          {selectedDate.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
          })}
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.addBtn,
            pressed && { opacity: 0.8 },
          ]}
          onPress={() =>
            router.push({
              pathname: "/create-post",
              params: { date: selectedDate.toISOString() },
            })
          }
          testID="new-post"
        >
          <Feather name="plus" size={18} color={c.background} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.emptyState}>
          <View style={styles.skeleton} />
        </View>
      ) : dayPosts.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="calendar" size={40} color={c.textMuted} />
          <Text style={styles.emptyText}>No posts scheduled</Text>
          <Text style={styles.emptySubtext}>
            Tap + to schedule a post for this day
          </Text>
        </View>
      ) : (
        <FlatList
          data={dayPosts}
          keyExtractor={(item) => String(item.id)}
          scrollEnabled={dayPosts.length > 0}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.postCard}>
              <View style={styles.postTimeline}>
                <View
                  style={[
                    styles.postDot,
                    {
                      backgroundColor:
                        platformColors[item.platform] || c.tint,
                    },
                  ]}
                />
                <View style={styles.postLine} />
              </View>
              <View style={styles.postContent}>
                <View style={styles.postTop}>
                  <View
                    style={[
                      styles.platformBadge,
                      {
                        backgroundColor:
                          (platformColors[item.platform] || c.tint) + "20",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.platformText,
                        {
                          color: platformColors[item.platform] || c.tint,
                        },
                      ]}
                    >
                      {item.platform}
                    </Text>
                  </View>
                  <Text style={styles.postTime}>
                    {new Date(item.scheduledAt).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
                <Text style={styles.postText} numberOfLines={3}>
                  {item.content}
                </Text>
                <View
                  style={[
                    styles.statusChip,
                    {
                      backgroundColor:
                        item.status === "ready"
                          ? c.success + "20"
                          : item.status === "published"
                            ? c.tint + "20"
                            : c.warning + "20",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusChipText,
                      {
                        color:
                          item.status === "ready"
                            ? c.success
                            : item.status === "published"
                              ? c.tint
                              : c.warning,
                      },
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  header: { paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
  headerTitle: { fontFamily: fonts.bold, fontSize: 28, color: c.text },
  headerSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: c.textSecondary,
    marginTop: 2,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  monthLabel: { fontFamily: fonts.semibold, fontSize: 16, color: c.text },
  weekRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  dayCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    gap: 2,
  },
  dayCellSelected: { backgroundColor: c.tint },
  dayLabel: { fontFamily: fonts.medium, fontSize: 11, color: c.textMuted },
  dayLabelSelected: { color: c.background },
  dayNumber: { fontFamily: fonts.semibold, fontSize: 16, color: c.text },
  dayNumberSelected: { color: c.background },
  dayNumberToday: { color: c.tint },
  dayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: c.tint,
  },
  dayDotSelected: { backgroundColor: c.background },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  dayHeaderText: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: c.textSecondary,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: c.tint,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: 120 },
  postCard: {
    flexDirection: "row",
    marginBottom: spacing.md,
  },
  postTimeline: {
    width: 20,
    alignItems: "center",
  },
  postDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  postLine: {
    width: 2,
    flex: 1,
    backgroundColor: c.border,
    marginTop: 2,
  },
  postContent: {
    flex: 1,
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginLeft: spacing.sm,
    borderWidth: 1,
    borderColor: c.border,
  },
  postTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  platformBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  platformText: { fontFamily: fonts.medium, fontSize: 11 },
  postTime: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: c.textSecondary,
  },
  postText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: c.text,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  statusChip: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  statusChipText: { fontFamily: fonts.medium, fontSize: 11 },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
    gap: spacing.sm,
  },
  emptyText: { fontFamily: fonts.semibold, fontSize: 16, color: c.textMuted },
  emptySubtext: { fontFamily: fonts.regular, fontSize: 13, color: c.textMuted },
  skeleton: {
    height: 16,
    width: "60%",
    backgroundColor: c.surface,
    borderRadius: radius.sm,
  },
});
