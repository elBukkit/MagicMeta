package com.elmakers.mine.bukkit.meta.platform;

import org.bukkit.inventory.ItemStack;

import com.elmakers.mine.bukkit.utility.platform.Platform;
import com.elmakers.mine.bukkit.utility.platform.base.NBTUtilsBase;

public class NBTUtils extends NBTUtilsBase {
    public NBTUtils(Platform platform) {
        super(platform);
    }

    @Override
    public Object getNode(ItemStack stack, String tag) {
        return null;
    }

    @Override
    public Object getNode(Object nbtBase, String tag) {
        return null;
    }

    @Override
    public Object createNode(Object nbtBase, String tag) {
        return null;
    }

    @Override
    public Object createNode(ItemStack stack, String tag) {
        return null;
    }

    @Override
    public boolean containsNode(Object nbtBase, String tag) {
        return false;
    }

    @Override
    public String getMetaString(Object node, String tag) {
        return null;
    }

    @Override
    public String getMetaString(ItemStack stack, String tag) {
        return null;
    }

    @Override
    public Byte getMetaByte(Object node, String tag) {
        return null;
    }

    @Override
    public Integer getMetaInt(Object node, String tag) {
        return null;
    }

    @Override
    public Double getMetaDouble(Object node, String tag) {
        return null;
    }

    @Override
    public Boolean getMetaBoolean(Object node, String tag) {
        return null;
    }

    @Override
    public void setMetaNode(Object node, String tag, Object child) {

    }

    @Override
    public boolean setMetaNode(ItemStack stack, String tag, Object child) {
        return false;
    }

    @Override
    public void setMeta(ItemStack stack, String tag, String value) {

    }

    @Override
    public void setMeta(Object node, String tag, String value) {

    }

    @Override
    public void setMetaLong(Object node, String tag, long value) {

    }

    @Override
    public void setMetaBoolean(Object node, String tag, boolean value) {

    }

    @Override
    public void setMetaDouble(Object node, String tag, double value) {

    }

    @Override
    public void setMetaInt(Object node, String tag, int value) {

    }

    @Override
    public void removeMeta(Object node, String tag) {

    }

    @Override
    public void addToList(Object listObject, Object node) {

    }
}
