package com.elmakers.mine.bukkit.meta.platform;

import java.util.Collection;
import java.util.List;

import org.bukkit.inventory.ItemStack;

import com.elmakers.mine.bukkit.utility.platform.Platform;
import com.elmakers.mine.bukkit.utility.platform.base.ItemUtilsBase;

public class ItemUtils extends ItemUtilsBase {
    public ItemUtils(Platform platform) {
        super(platform);
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
    public ItemStack getCopy(ItemStack stack) {
        return null;
    }

    @Override
    public ItemStack makeReal(ItemStack stack) {
        return null;
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
}
