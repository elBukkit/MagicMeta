package com.elmakers.mine.bukkit.meta.platform;

import java.util.UUID;

import org.bukkit.entity.Player;

import com.elmakers.mine.bukkit.utility.platform.Platform;
import com.elmakers.mine.bukkit.utility.platform.base.SkinUtilsBase;
import com.google.gson.JsonElement;

public class SkinUtils extends SkinUtilsBase {
    public SkinUtils(Platform platform) {
        super(platform);
    }

    @Override
    public String getProfileURL(Object profile) {
        return null;
    }

    @Override
    public Object getProfile(Player player) {
        return null;
    }

    @Override
    public JsonElement getProfileJson(Object gameProfile) throws IllegalAccessException {
        return null;
    }

    @Override
    public Object getGameProfile(UUID uuid, String playerName, String profileJSON) {
        return null;
    }
}
