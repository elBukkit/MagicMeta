package com.elmakers.mine.bukkit.meta.platform;

import java.util.Collection;
import java.util.List;

import org.bukkit.configuration.ConfigurationSection;
import org.bukkit.inventory.ItemStack;
import org.bukkit.inventory.meta.ItemMeta;

import com.elmakers.mine.bukkit.api.magic.MageController;
import com.elmakers.mine.bukkit.utility.platform.Platform;

public class ItemUtils implements com.elmakers.mine.bukkit.utility.platform.ItemUtils {
    private final Platform platform;

    public ItemUtils(Platform platform) {
        this.platform = platform;
    }

    @Override
    public Object getHandle(ItemStack stack) {
        return null;
    }

    @Override
    public Object getTag(Object mcItemStack) {
        return null;
    }

    @Override
    public Object getTag(ItemStack itemStack) {
        return null;
    }

    @Override
    public Object getOrCreateTag(Object mcItemStack) {
        return null;
    }

    @Override
    public Object getOrCreateTag(ItemStack itemStack) {
        return null;
    }

    @Override
    public ItemStack getCopy(ItemStack stack) {
        return null;
    }

    @Override
    public ItemStack makeReal(ItemStack stack) {
        return null;
    }

    @Override
    public void addGlow(ItemStack stack) {

    }

    @Override
    public void removeGlow(ItemStack stack) {

    }

    @Override
    public boolean isUnbreakable(ItemStack stack) {
        return false;
    }

    @Override
    public void makeUnbreakable(ItemStack stack) {

    }

    @Override
    public void removeUnbreakable(ItemStack stack) {

    }

    @Override
    public void hideFlags(ItemStack stack, int flags) {

    }

    @Override
    public void makeTemporary(ItemStack itemStack, String message) {

    }

    @Override
    public boolean isTemporary(ItemStack itemStack) {
        return false;
    }

    @Override
    public void makeUnplaceable(ItemStack itemStack) {

    }

    @Override
    public void removeUnplaceable(ItemStack itemStack) {

    }

    @Override
    public boolean isUnplaceable(ItemStack itemStack) {
        return false;
    }

    @Override
    public String getTemporaryMessage(ItemStack itemStack) {
        return "";
    }

    @Override
    public void setReplacement(ItemStack itemStack, ItemStack replacement) {

    }

    @Override
    public ItemStack getReplacement(ItemStack itemStack) {
        return null;
    }

    @Override
    public boolean isEmpty(ItemStack itemStack) {
        return false;
    }

    @Override
    public Object setStringList(Object nbtBase, String tag, Collection<String> values) {
        return null;
    }

    @Override
    public List<String> getStringList(Object o, String s) {
        return null;
    }

    @Override
    public ItemStack getItem(Object itemTag) {
        return null;
    }

    @Override
    public ItemStack[] getItems(Object rootTag, String tagName) {
        return new ItemStack[0];
    }

    @Override
    public boolean isSameItem(ItemStack first, ItemStack second) {
        return false;
    }

    @Override
    public boolean hasSameTags(ItemStack first, ItemStack second) {
        return false;
    }

    @Override
    public int getCustomModelData(ItemStack itemStack) {
        return 0;
    }

    @Override
    public void setCustomModelData(ItemStack itemStack, int customModelData) {

    }

    @Override
    public String getItemModel(ItemStack itemStack) {
        return "";
    }

    @Override
    public void setItemModel(ItemStack itemStack, String model) {

    }

    @Override
    public Object getEquippable(ItemStack itemStack) {
        return null;
    }

    @Override
    public void setEquippable(ItemStack itemStack, Object equippable) {

    }

    @Override
    public void removeCustomData(ItemStack itemStack) {

    }

    @Override
    public void removeDamage(ItemStack itemStack) {

    }

    @Override
    public void loadMeta(MageController controller, ItemMeta itemMeta, ConfigurationSection configuration) {

    }

    @Override
    public void saveMeta(MageController controller, ItemMeta itemMeta, ConfigurationSection configuration) {

    }
}
