package com.elmakers.mine.bukkit.meta.platform;

import java.lang.reflect.InvocationTargetException;
import java.net.URL;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.bukkit.Location;
import org.bukkit.block.Skull;
import org.bukkit.entity.Player;
import org.bukkit.inventory.ItemStack;
import org.bukkit.inventory.meta.ItemMeta;

import com.elmakers.mine.bukkit.utility.platform.Platform;
import com.elmakers.mine.bukkit.utility.platform.base.InventoryUtilsBase;

public class InventoryUtils extends InventoryUtilsBase {
    public InventoryUtils(Platform platform) {
        super(platform);
    }

    @Override
    public boolean saveTagsToNBT(Map<String, Object> tags, Object node, Set<String> tagNames) {
        return false;
    }

    @Override
    public boolean addTagsToNBT(Map<String, Object> tags, Object node) {
        return false;
    }

    @Override
    public Object wrapInTag(Object value) throws IllegalAccessException, InvocationTargetException, InstantiationException {
        return null;
    }

    @Override
    public Set<String> getTagKeys(Object tag) {
        return null;
    }

    @Override
    public Object getMetaObject(Object tag, String key) {
        return null;
    }

    @Override
    public Object getTagValue(Object tag) throws IllegalAccessException, InvocationTargetException {
        return null;
    }

    @Override
    public ItemStack setSkullURL(ItemStack itemStack, URL url, UUID id, String name) {
        return null;
    }

    @Override
    public boolean isSkull(ItemStack item) {
        return false;
    }

    @Override
    public Object getSkullProfile(ItemMeta itemMeta) {
        return null;
    }

    @Override
    public Object getSkullProfile(Skull state) {
        return null;
    }

    @Override
    public boolean setSkullProfile(Skull state, Object data) {
        return false;
    }

    @Override
    public boolean setSkullProfile(ItemMeta itemMeta, Object data) {
        return false;
    }

    @Override
    public void openSign(Player player, Location signBlock) {

    }
}
