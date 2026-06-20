package com.elmakers.mine.bukkit.meta.platform;

import java.util.Collection;
import java.util.List;

import org.bukkit.configuration.ConfigurationSection;
import org.bukkit.entity.Entity;

import com.elmakers.mine.bukkit.mob.GoalConfiguration;
import com.elmakers.mine.bukkit.mob.GoalType;
import com.elmakers.mine.bukkit.utility.platform.Platform;

public class MobUtils implements com.elmakers.mine.bukkit.utility.platform.MobUtils {
    private final com.elmakers.mine.bukkit.utility.platform.Platform platform;

    public MobUtils(Platform platform) {
        this.platform = platform;
    }

    @Override
    public boolean removeGoals(Entity entity) {
        return false;
    }

    @Override
    public boolean removeGoal(Entity entity, GoalType goalType) {
        return false;
    }

    @Override
    public Collection<String> getGoalDescriptions(Entity entity) {
        return List.of();
    }

    @Override
    public boolean addGoal(Entity entity, GoalType goalType, int priority, ConfigurationSection config) {
        return false;
    }

    @Override
    public boolean addGoal(Entity entity, GoalConfiguration goal) {
        return false;
    }

    @Override
    public boolean removeTargetGoals(Entity entity) {
        return false;
    }

    @Override
    public boolean removeTargetGoal(Entity entity, GoalType goalType) {
        return false;
    }

    @Override
    public Collection<String> getTargetGoalDescriptions(Entity entity) {
        return List.of();
    }

    @Override
    public boolean addTargetGoal(Entity entity, GoalType goalType, int priority, ConfigurationSection config) {
        return false;
    }

    @Override
    public boolean addTargetGoal(Entity entity, GoalConfiguration goal) {
        return false;
    }

    @Override
    public boolean setPathfinderTarget(Entity entity, Entity target, double speed) {
        return false;
    }
}
