package com.example.demo.dtos;

import java.util.List;

public class DashboardStats {
    private long totalUsers;
    private long activeUsers;
    private long bannedUsers;
    private long totalPosts;
    private long pendingReports;
    private long criticalReports;
    private long resolvedReports;
    private double platformHealth;
    private long newUsersThisMonth;
    private long newPostsThisMonth;
    private List<TagCount> topTags;
    private List<GrowthData> userGrowth;
    private List<GrowthData> postGrowth;

    // Getters and setters
    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(long activeUsers) {
        this.activeUsers = activeUsers;
    }

    public long getBannedUsers() {
        return bannedUsers;
    }

    public void setBannedUsers(long bannedUsers) {
        this.bannedUsers = bannedUsers;
    }

    public long getTotalPosts() {
        return totalPosts;
    }

    public void setTotalPosts(long totalPosts) {
        this.totalPosts = totalPosts;
    }

    public long getPendingReports() {
        return pendingReports;
    }

    public void setPendingReports(long pendingReports) {
        this.pendingReports = pendingReports;
    }

    public long getCriticalReports() {
        return criticalReports;
    }

    public void setCriticalReports(long criticalReports) {
        this.criticalReports = criticalReports;
    }

    public long getResolvedReports() {
        return resolvedReports;
    }

    public void setResolvedReports(long resolvedReports) {
        this.resolvedReports = resolvedReports;
    }

    public double getPlatformHealth() {
        return platformHealth;
    }

    public void setPlatformHealth(double platformHealth) {
        this.platformHealth = platformHealth;
    }

    public long getNewUsersThisMonth() {
        return newUsersThisMonth;
    }

    public void setNewUsersThisMonth(long newUsersThisMonth) {
        this.newUsersThisMonth = newUsersThisMonth;
    }

    public long getNewPostsThisMonth() {
        return newPostsThisMonth;
    }

    public void setNewPostsThisMonth(long newPostsThisMonth) {
        this.newPostsThisMonth = newPostsThisMonth;
    }

    public List<TagCount> getTopTags() {
        return topTags;
    }

    public void setTopTags(List<TagCount> topTags) {
        this.topTags = topTags;
    }

    public List<GrowthData> getUserGrowth() {
        return userGrowth;
    }

    public void setUserGrowth(List<GrowthData> userGrowth) {
        this.userGrowth = userGrowth;
    }

    public List<GrowthData> getPostGrowth() {
        return postGrowth;
    }

    public void setPostGrowth(List<GrowthData> postGrowth) {
        this.postGrowth = postGrowth;
    }

    // Supporting classes
    public static class TagCount {
        private String tag;
        private long count;

        public TagCount() {}

        public TagCount(String tag, long count) {
            this.tag = tag;
            this.count = count;
        }

        public String getTag() {
            return tag;
        }

        public void setTag(String tag) {
            this.tag = tag;
        }

        public long getCount() {
            return count;
        }

        public void setCount(long count) {
            this.count = count;
        }
    }

    public static class GrowthData {
        private String month;
        private long users;
        private long posts;

        public GrowthData() {}

        public GrowthData(String month, long users, long posts) {
            this.month = month;
            this.users = users;
            this.posts = posts;
        }

        public String getMonth() {
            return month;
        }

        public void setMonth(String month) {
            this.month = month;
        }

        public long getUsers() {
            return users;
        }

        public void setUsers(long users) {
            this.users = users;
        }

        public long getPosts() {
            return posts;
        }

        public void setPosts(long posts) {
            this.posts = posts;
        }
    }
}