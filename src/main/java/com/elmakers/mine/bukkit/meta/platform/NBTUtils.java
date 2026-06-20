package com.elmakers.mine.bukkit.meta.platform;

import java.io.InputStream;
import java.io.OutputStream;
import java.lang.reflect.InvocationTargetException;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.bukkit.configuration.ConfigurationSection;
import org.bukkit.entity.EntityType;
import org.bukkit.inventory.ItemStack;

import com.elmakers.mine.bukkit.utility.platform.Platform;

public class NBTUtils implements com.elmakers.mine.bukkit.utility.platform.NBTUtils {
    private final Platform platform;

    public NBTUtils(Platform platform) {
        this.platform = platform;
    }

    @Override
    public boolean containsTag(ItemStack stack, String tag) {
        return false;
    }

    @Override
    public Object getTag(ItemStack stack, String tag) {
        return null;
    }

    @Override
    public Object getTag(Object nbtBase, String tag) {
        return null;
    }

    @Override
    public Object getCompoundTagFromCustomData(Object customData) {
        return null;
    }

    @Override
    public Object createTag(Object nbtBase, String tag) {
        return null;
    }

    @Override
    public Object createTag(ItemStack stack, String tag) {
        return null;
    }

    @Override
    public boolean contains(Object nbtBase, String tag) {
        return false;
    }

    @Override
    public String getString(Object node, String tag, String defaultValue) {
        return "";
    }

    @Override
    public String getString(Object node, String tag) {
        return null;
    }

    @Override
    public String getString(ItemStack stack, String tag) {
        return null;
    }

    @Override
    public String getString(ItemStack stack, String tag, String defaultValue) {
        return "";
    }

    @Override
    public Byte getOptionalByte(Object node, String tag) {
        return null;
    }

    @Override
    public Short getOptionalShort(Object node, String tag) {
        return null;
    }

    @Override
    public short getShort(Object node, String tag, short defaultValue) {
        return 0;
    }

    @Override
    public Integer getOptionalInt(Object node, String tag) {
        return null;
    }

    @Override
    public int getInt(Object node, String tag, int defaultValue) {
        return 0;
    }

    @Override
    public int getInt(ItemStack stack, String tag, int defaultValue) {
        return 0;
    }

    @Override
    public Double getOptionalDouble(Object node, String tag) {
        return null;
    }

    @Override
    public boolean getBoolean(ItemStack stack, String tag, boolean defaultValue) {
        return false;
    }

    @Override
    public Boolean getOptionalBoolean(Object node, String tag) {
        return null;
    }

    @Override
    public byte[] getByteArray(Object tag, String key) {
        return new byte[0];
    }

    @Override
    public int[] getIntArray(Object tag, String key) {
        return new int[0];
    }

    @Override
    public void parseAndSet(Object node, String tag, String value) {

    }

    @Override
    public void setTag(Object node, String tag, Object child) {

    }

    @Override
    public boolean setTag(ItemStack stack, String tag, Object child) {
        return false;
    }

    @Override
    public void setString(ItemStack stack, String tag, String value) {

    }

    @Override
    public void setString(Object node, String tag, String value) {

    }

    @Override
    public void setLong(Object node, String tag, long value) {

    }

    @Override
    public void setBoolean(Object node, String tag, boolean value) {

    }

    @Override
    public void setBoolean(ItemStack stack, String tag, boolean value) {

    }

    @Override
    public void setDouble(Object node, String tag, double value) {

    }

    @Override
    public void setInt(Object node, String tag, int value) {

    }

    @Override
    public void setInt(ItemStack stack, String tag, int value) {

    }

    @Override
    public void setMetaShort(Object node, String tag, short value) {

    }

    @Override
    public void setIntArray(Object tag, String key, int[] value) {

    }

    @Override
    public void setByteArray(Object tag, String key, byte[] value) {

    }

    @Override
    public Object setEmptyList(Object tag, String key) {
        return null;
    }

    @Override
    public void removeMeta(Object node, String tag) {

    }

    @Override
    public void removeMeta(ItemStack stack, String tag) {

    }

    @Override
    public void addToList(Object listObject, Object node) {

    }

    @Override
    public Object readTagFromStream(InputStream input) {
        return null;
    }

    @Override
    public boolean writeTagToStream(Object tag, OutputStream output) {
        return false;
    }

    @Override
    public Set<String> getAllKeys(Object tag) {
        return null;
    }

    @Override
    public List<Object> getTagList(Object tag, String key) {
        return null;
    }

    @Override
    public List<Integer> getIntList(Object tag, String key) {
        return List.of();
    }

    @Override
    public Object newCompoundTag() {
        return null;
    }

    @Override
    public boolean setSpawnEggEntityData(ItemStack spawnEgg, EntityType entityType, Object entityData) {
        return false;
    }

    @Override
    public Object getSpawnEggEntityData(ItemStack spawnEgg) {
        return null;
    }

    @Override
    public EntityType getSpawnEggEntityType(ItemStack itemStack) {
        return null;
    }

    @Override
    public void removeSpawnEggEntityData(ItemStack spawnEgg) {

    }

    @Override
    public boolean saveTagsToItem(ConfigurationSection tags, ItemStack item) {
        return false;
    }

    @Override
    public boolean saveTagsToNBT(ConfigurationSection tags, Object node) {
        return false;
    }

    @Override
    public boolean saveTagsToNBT(ConfigurationSection tags, Object node, Set<String> tagNames) {
        return false;
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
    public Object wrapInTag(Object value) {
        return null;
    }

    @Override
    public Set<String> getTagKeys(Object tag) {
        return Set.of();
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
    public void convertIntegers(Map<String, Object> m) {

    }
}
