package com.elmakers.mine.bukkit.meta.platform;

import java.util.UUID;

import org.bukkit.block.Skull;
import org.bukkit.configuration.ConfigurationSection;
import org.bukkit.entity.Player;
import org.bukkit.inventory.meta.SkullMeta;

import com.elmakers.mine.bukkit.utility.PlayerProfile;
import com.elmakers.mine.bukkit.utility.ProfileCallback;
import com.elmakers.mine.bukkit.utility.platform.Platform;

public class SkinUtils implements com.elmakers.mine.bukkit.utility.platform.SkinUtils {
    private final Platform platform;

    public SkinUtils(Platform platform) {
        this.platform = platform;
    }

    @Override
    public String getOnlineSkinURL(Player player) {
        return "";
    }

    @Override
    public String getOnlineSkinURL(String playerName) {
        return "";
    }

    @Override
    public void fetchProfile(String playerName, ProfileCallback callback) {

    }

    @Override
    public void fetchProfile(UUID uuid, ProfileCallback callback) {

    }

    @Override
    public PlayerProfile parsePlayerProfile(ConfigurationSection config) {
        return null;
    }

    @Override
    public PlayerProfile getPlayerProfile(SkullMeta meta) {
        return null;
    }

    @Override
    public PlayerProfile getPlayerProfile(Skull block) {
        return null;
    }
}
